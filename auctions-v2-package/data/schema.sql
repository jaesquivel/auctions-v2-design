-- Auctions / Remates proposed initial PostgreSQL schema. Review before production.
-- No production data or users are created. UUIDs use built-in gen_random_uuid().
BEGIN;
CREATE TABLE jurisdiction (
 country char(2) PRIMARY KEY CHECK (country ~ '^[A-Z]{2}$'),
 singleton boolean NOT NULL DEFAULT true UNIQUE CHECK(singleton),
 name text NOT NULL, default_locale text NOT NULL, timezone text NOT NULL, adapter_version text NOT NULL
);
-- Deployment tooling provisions exactly one jurisdiction matching INSTANCE_COUNTRY.
-- Runtime/app administrators receive no INSERT/UPDATE/DELETE grants on jurisdiction.
-- Startup fails if profile is absent or disagrees with instance configuration.
CREATE TABLE source (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), country char(2) NOT NULL REFERENCES jurisdiction,
 name text NOT NULL, config_reference text NOT NULL, enabled boolean NOT NULL DEFAULT false,
 approval_reference text, CHECK (NOT enabled OR approval_reference IS NOT NULL)
);
CREATE TABLE ingestion_run (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source_id uuid NOT NULL REFERENCES source,
 state text NOT NULL CHECK(state IN ('discovered','fetched','extracted','review_required','published','quarantined')),
 adapter_version text NOT NULL, attempt integer NOT NULL DEFAULT 1 CHECK(attempt > 0),
 started_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz, error_code text, checkpoint jsonb
);
CREATE TABLE source_document (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), source_id uuid NOT NULL REFERENCES source,
 sha256 char(64) NOT NULL CHECK(sha256 ~ '^[0-9a-f]{64}$'), object_key text NOT NULL,
 source_url text NOT NULL, media_type text NOT NULL, published_at timestamptz,
 first_fetched_at timestamptz NOT NULL DEFAULT now(), UNIQUE(source_id,sha256)
);
CREATE TABLE fetch_observation (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), document_id uuid REFERENCES source_document,
 run_id uuid NOT NULL REFERENCES ingestion_run, fetched_at timestamptz NOT NULL DEFAULT now(),
 status_code integer NOT NULL, locator text NOT NULL
);
CREATE TABLE notice (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), country char(2) NOT NULL REFERENCES jurisdiction,
 notice_reference text, case_number text,
 source_notice_key text, current_revision integer, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE notice_revision (
 notice_id uuid NOT NULL REFERENCES notice, revision integer NOT NULL CHECK(revision > 0),
 document_id uuid NOT NULL REFERENCES source_document, source_locator text NOT NULL,
 original_text text NOT NULL, language text NOT NULL, parser_version text NOT NULL,
 -- Revision-scoped source facts, never organization research notes.
 parties jsonb NOT NULL DEFAULT '[]', venue text, office text,
 publication jsonb, extraction_notes jsonb NOT NULL DEFAULT '[]',
 quality text NOT NULL CHECK(quality IN ('reviewed','needs_review')),
 published_at timestamptz, reviewer_id text, reviewed_at timestamptz,
 PRIMARY KEY(notice_id,revision),
 CHECK (quality <> 'reviewed' OR (reviewer_id IS NOT NULL AND reviewed_at IS NOT NULL))
);
ALTER TABLE notice ADD CONSTRAINT notice_current_revision_fk
 FOREIGN KEY(id,current_revision) REFERENCES notice_revision(notice_id,revision) DEFERRABLE INITIALLY DEFERRED;
CREATE TABLE extraction (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), notice_id uuid NOT NULL REFERENCES notice,
 document_id uuid NOT NULL REFERENCES source_document, run_id uuid NOT NULL REFERENCES ingestion_run,
 state text NOT NULL CHECK(state IN ('extracted','review_required','published','quarantined')),
 normalized_fields jsonb NOT NULL DEFAULT '{}', evidence jsonb NOT NULL DEFAULT '[]',
 version integer NOT NULL DEFAULT 1 CHECK(version > 0), parser_version text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE asset (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), country char(2) NOT NULL REFERENCES jurisdiction,
 category text NOT NULL CHECK(category IN ('properties','vehicles','other')),
 asset_type text NOT NULL,
 CHECK ((category='properties' AND asset_type IN ('house','land','apartment','commercial')) OR
        (category='vehicles' AND asset_type IN ('car','motorcycle','truck','vehicle_other')) OR
        (category='other' AND asset_type IN ('equipment','inventory','other'))),
 CHECK (category='properties' OR area_m2 IS NULL),
 title text NOT NULL, registry_reference text, region_code text, locality text,
 area_m2 numeric(20,4) CHECK(area_m2 >= 0),
 latitude numeric(9,6) CHECK(latitude BETWEEN -90 AND 90), longitude numeric(9,6) CHECK(longitude BETWEEN -180 AND 180),
 location_precision text NOT NULL DEFAULT 'unknown' CHECK(location_precision IN ('parcel','street','district','canton','province','unknown')),
 location_provenance jsonb, quality text NOT NULL CHECK(quality IN ('reviewed','needs_review')),
 reported_status text NOT NULL DEFAULT 'unknown' CHECK(reported_status IN ('scheduled','postponed','cancelled','concluded','unknown')),
 notice_description text, notice_liens text,
 jurisdiction_fields jsonb NOT NULL DEFAULT '{}', search_vector tsvector,
 last_checked_at timestamptz, version integer NOT NULL DEFAULT 1 CHECK(version > 0),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK ((latitude IS NULL) = (longitude IS NULL)),
 CHECK ((location_precision = 'unknown' AND latitude IS NULL) OR (location_precision <> 'unknown' AND latitude IS NOT NULL))
);
-- registry_reference is not globally unique: adapter/reviewer resolves ambiguous identity.
CREATE TABLE asset_notice (
 asset_id uuid NOT NULL REFERENCES asset, notice_id uuid NOT NULL, revision integer NOT NULL,
 PRIMARY KEY(asset_id,notice_id,revision), FOREIGN KEY(notice_id,revision) REFERENCES notice_revision(notice_id,revision)
);
CREATE TABLE auction_event (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), asset_id uuid NOT NULL REFERENCES asset,
 notice_id uuid NOT NULL, notice_revision integer NOT NULL,
 ordinal integer NOT NULL CHECK(ordinal > 0), starts_at timestamptz, local_date date, timezone text NOT NULL,
 precision text NOT NULL CHECK(precision IN ('datetime','date','unknown')),
 base_amount numeric(20,2) CHECK(base_amount >= 0), currency char(3) CHECK(currency ~ '^[A-Z]{3}$'),
 status text NOT NULL DEFAULT 'unknown' CHECK(status IN ('scheduled','postponed','cancelled','concluded','unknown')),
 FOREIGN KEY(notice_id,notice_revision) REFERENCES notice_revision(notice_id,revision),
 UNIQUE(asset_id,notice_id,notice_revision,ordinal),
 CHECK((base_amount IS NULL) = (currency IS NULL)),
 CHECK((precision='datetime' AND starts_at IS NOT NULL AND local_date IS NOT NULL)
    OR (precision='date' AND starts_at IS NULL AND local_date IS NOT NULL)
    OR (precision='unknown' AND starts_at IS NULL AND local_date IS NULL))
);
CREATE TABLE field_evidence (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), notice_id uuid NOT NULL, revision integer NOT NULL,
 asset_id uuid REFERENCES asset, event_id uuid REFERENCES auction_event, field_name text NOT NULL,
 raw_text text NOT NULL, normalized_value jsonb, page integer CHECK(page > 0),
 start_offset integer CHECK(start_offset >= 0), end_offset integer CHECK(end_offset >= start_offset),
 confidence numeric(5,4) CHECK(confidence BETWEEN 0 AND 1), parser_version text NOT NULL,
 reviewer_id text, reviewed_at timestamptz, FOREIGN KEY(notice_id,revision) REFERENCES notice_revision(notice_id,revision)
);
CREATE TABLE catalog_tag (code text PRIMARY KEY, label_es text NOT NULL, label_en text NOT NULL);
CREATE TABLE asset_tag (asset_id uuid REFERENCES asset, tag_code text REFERENCES catalog_tag, PRIMARY KEY(asset_id,tag_code));
CREATE TABLE asset_alias (
 old_asset_id uuid PRIMARY KEY REFERENCES asset, canonical_asset_id uuid NOT NULL REFERENCES asset,
 reason text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), CHECK(old_asset_id <> canonical_asset_id)
);
-- Every workspace is backed by a Clerk organization, including one-person organizations.
CREATE TABLE workspace (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), kind text NOT NULL DEFAULT 'organization' CHECK(kind='organization'),
 name text NOT NULL, clerk_org_id text NOT NULL UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE app_user (
 id text PRIMARY KEY, locale text NOT NULL DEFAULT 'es',
 primary_workspace_id uuid NOT NULL REFERENCES workspace,
 primary_membership_status text NOT NULL DEFAULT 'active' CHECK(primary_membership_status='active'),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE membership (
 workspace_id uuid NOT NULL REFERENCES workspace, user_id text NOT NULL REFERENCES app_user,
 role text NOT NULL CHECK(role IN ('ADMIN','MANAGER','USER')),
 status text NOT NULL CHECK(status IN ('active','removed')), synced_at timestamptz NOT NULL,
 version integer NOT NULL DEFAULT 1 CHECK(version > 0), PRIMARY KEY(workspace_id,user_id), UNIQUE(workspace_id,user_id,status)
);
-- Deferred circular reference permits user and membership creation in one transaction.
-- Final membership removal must reassign the primary organization or close the account.
ALTER TABLE app_user ADD CONSTRAINT user_requires_active_organization
 FOREIGN KEY(primary_workspace_id,id,primary_membership_status)
 REFERENCES membership(workspace_id,user_id,status) DEFERRABLE INITIALLY DEFERRED;
-- SYSADMIN is separate from organization membership.role and never assigned by tenant APIs.
CREATE TABLE system_role_assignment (
 user_id text NOT NULL REFERENCES app_user, role text NOT NULL CHECK(role='SYSADMIN'),
 active boolean NOT NULL DEFAULT true, granted_by text NOT NULL,
 granted_at timestamptz NOT NULL DEFAULT now(), revoked_at timestamptz,
 version integer NOT NULL DEFAULT 1 CHECK(version > 0), PRIMARY KEY(user_id,role),
 CHECK((active AND revoked_at IS NULL) OR (NOT active AND revoked_at IS NOT NULL))
);
CREATE TABLE system_settings (
 singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),
 ingestion_enabled boolean NOT NULL DEFAULT true,
 source_check_interval_minutes integer NOT NULL DEFAULT 60 CHECK(source_check_interval_minutes BETWEEN 15 AND 1440),
 version integer NOT NULL DEFAULT 1 CHECK(version > 0), updated_at timestamptz NOT NULL DEFAULT now()
);
-- Dedicated authorization/system repositories own these tables. Ordinary tenant roles
-- receive no direct write grants. Country remains in the deployment/jurisdiction profile.
CREATE TABLE asset_annotation (
 workspace_id uuid NOT NULL REFERENCES workspace, asset_id uuid NOT NULL REFERENCES asset,
 creator_user_id text REFERENCES app_user, note text NOT NULL DEFAULT '',
 version integer NOT NULL DEFAULT 1 CHECK(version > 0), created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(), appraisal_amount numeric(16,2) CHECK(appraisal_amount >= 0), appraisal_currency char(3),
 market_amount numeric(16,2) CHECK(market_amount >= 0), market_currency char(3),
 CHECK((market_amount IS NULL)=(market_currency IS NULL)),
 CHECK((appraisal_amount IS NULL)=(appraisal_currency IS NULL)),
 PRIMARY KEY(workspace_id,asset_id)
);
CREATE TABLE organization_tag (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id uuid NOT NULL REFERENCES workspace,
 label varchar(40) NOT NULL CHECK(length(btrim(label)) > 0), normalized_label varchar(40) NOT NULL,
 color text NOT NULL DEFAULT 'gray' CHECK(color IN ('gray','blue','green','amber','red','purple')),
 deleted_at timestamptz, version integer NOT NULL DEFAULT 1 CHECK(version > 0),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(workspace_id,id), UNIQUE(workspace_id,normalized_label)
);
CREATE TABLE asset_tag_assignment (
 workspace_id uuid NOT NULL, asset_id uuid NOT NULL, tag_id uuid NOT NULL,
 assigned_by text REFERENCES app_user ON DELETE SET NULL, assigned_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(workspace_id,asset_id,tag_id),
 FOREIGN KEY(workspace_id) REFERENCES workspace,
 FOREIGN KEY(asset_id) REFERENCES asset,
 FOREIGN KEY(workspace_id,tag_id) REFERENCES organization_tag(workspace_id,id)
);
-- Service validates ADMIN/MANAGER permissions, normalized labels, deletion state and max 20 assignments.
-- Soft-delete definitions instead of hard-deleting them; preserve stable IDs and history.
CREATE TABLE asset_image (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), workspace_id uuid NOT NULL REFERENCES workspace,
 asset_id uuid NOT NULL REFERENCES asset, uploaded_by text REFERENCES app_user ON DELETE SET NULL,
 object_key text NOT NULL UNIQUE, file_name varchar(255) NOT NULL,
 content_type text NOT NULL CHECK(content_type IN ('image/jpeg','image/png','image/webp')),
 byte_size bigint NOT NULL CHECK(byte_size > 0 AND byte_size <= 10485760),
 sha256 char(64), state text NOT NULL CHECK(state IN ('pending','processing','ready','rejected','deleted')),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), deleted_at timestamptz
);
CREATE TABLE saved_search (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_user_id text NOT NULL REFERENCES app_user,
 context_workspace_id uuid REFERENCES workspace ON DELETE SET NULL, title text NOT NULL,
 filter jsonb NOT NULL CHECK(jsonb_typeof(filter)='object'), schema_version integer NOT NULL DEFAULT 3 CHECK(schema_version=3 AND filter @> '{"schemaVersion":3}'::jsonb AND filter ?& ARRAY['category','expression']),
 delivery text NOT NULL CHECK(delivery IN ('web','daily_email')), enabled boolean NOT NULL DEFAULT true,
 watermark timestamptz, version integer NOT NULL DEFAULT 1 CHECK(version > 0),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(id,owner_user_id)
);
CREATE TABLE alert_delivery (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), context_workspace_id uuid REFERENCES workspace ON DELETE SET NULL,
 search_id uuid NOT NULL, user_id text NOT NULL REFERENCES app_user, asset_id uuid NOT NULL REFERENCES asset,
 notice_id uuid NOT NULL, revision integer NOT NULL, state text NOT NULL CHECK(state IN ('pending','sent','failed','cancelled')),
 provider_message_id text, attempt integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(search_id,user_id) REFERENCES saved_search(id,owner_user_id) ON DELETE CASCADE,
 FOREIGN KEY(notice_id,revision) REFERENCES notice_revision(notice_id,revision),
 UNIQUE(search_id,user_id,asset_id,notice_id,revision)
);
CREATE TABLE subscription (
 workspace_id uuid PRIMARY KEY REFERENCES workspace, provider_subscription_id text UNIQUE,
 plan_key text NOT NULL, state text NOT NULL CHECK(state IN ('none','trialing','active','past_due','cancelled')),
 provider_updated_at timestamptz, version integer NOT NULL DEFAULT 1 CHECK(version > 0)
);
CREATE TABLE webhook_receipt (
 provider text NOT NULL, event_id text NOT NULL, received_at timestamptz NOT NULL DEFAULT now(),
 processed_at timestamptz, state text NOT NULL CHECK(state IN ('received','processed','failed')),
 sanitized_metadata jsonb NOT NULL DEFAULT '{}', PRIMARY KEY(provider,event_id)
);
CREATE TABLE idempotency_receipt (
 actor_id text NOT NULL, route_key text NOT NULL, key uuid NOT NULL,
 request_hash char(64) NOT NULL, status_code integer, response_body jsonb,
 created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL,
 PRIMARY KEY(actor_id,route_key,key), CHECK(expires_at > created_at)
);
CREATE TABLE outbox_event (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_type text NOT NULL, deduplication_key text NOT NULL UNIQUE,
 payload jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), processed_at timestamptz,
 attempts integer NOT NULL DEFAULT 0, next_attempt_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE audit_event (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id text NOT NULL, workspace_id uuid REFERENCES workspace,
 action text NOT NULL, object_type text NOT NULL, object_id text NOT NULL, request_id text NOT NULL,
 redacted_diff jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX asset_country_type ON asset(country,asset_type,reported_status);
CREATE INDEX asset_search ON asset USING gin(search_vector);
CREATE INDEX event_asset_time ON auction_event(asset_id,starts_at,id);
CREATE INDEX research_workspace_time ON asset_annotation(workspace_id,updated_at DESC);
CREATE INDEX search_owner ON saved_search(owner_user_id,id);
CREATE INDEX pending_outbox ON outbox_event(next_attempt_at) WHERE processed_at IS NULL;
CREATE INDEX audit_workspace_time ON audit_event(workspace_id,created_at DESC);
-- The service must set this ONLY after authentication and membership verification.
-- SET LOCAL app.workspace_id = '<authorized-workspace-uuid>' inside each private transaction.
-- Table owners normally bypass RLS; FORCE is deliberate. Never grant BYPASSRLS to app roles.
CREATE FUNCTION current_workspace_id() RETURNS uuid LANGUAGE sql STABLE AS $$
 SELECT nullif(current_setting('app.workspace_id',true),'')::uuid
$$;
CREATE FUNCTION current_app_user_id() RETURNS text LANGUAGE sql STABLE AS $$
 SELECT nullif(current_setting('app.user_id',true),'')
$$;
-- app.user_id must come from the verified session/worker context, never a request field.
ALTER TABLE asset_image ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_image FORCE ROW LEVEL SECURITY;
CREATE POLICY scoped_images ON asset_image USING(workspace_id=current_workspace_id()) WITH CHECK(workspace_id=current_workspace_id());
ALTER TABLE organization_tag ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_tag FORCE ROW LEVEL SECURITY;
CREATE POLICY scoped_tag_definitions ON organization_tag USING(workspace_id=current_workspace_id()) WITH CHECK(workspace_id=current_workspace_id());
ALTER TABLE asset_tag_assignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_tag_assignment FORCE ROW LEVEL SECURITY;
CREATE POLICY scoped_tag_assignments ON asset_tag_assignment USING(workspace_id=current_workspace_id()) WITH CHECK(workspace_id=current_workspace_id());
ALTER TABLE asset_annotation ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_annotation FORCE ROW LEVEL SECURITY;
CREATE POLICY scoped_annotations ON asset_annotation USING(workspace_id=current_workspace_id()) WITH CHECK(workspace_id=current_workspace_id());
ALTER TABLE saved_search ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_search FORCE ROW LEVEL SECURITY;
CREATE POLICY owned_searches ON saved_search USING(owner_user_id=current_app_user_id()) WITH CHECK(owner_user_id=current_app_user_id());
ALTER TABLE alert_delivery ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_delivery FORCE ROW LEVEL SECURITY;
CREATE POLICY owned_deliveries ON alert_delivery USING(user_id=current_app_user_id()) WITH CHECK(user_id=current_app_user_id());
ALTER TABLE subscription ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription FORCE ROW LEVEL SECURITY;
CREATE POLICY scoped_subscription ON subscription USING(workspace_id=current_workspace_id()) WITH CHECK(workspace_id=current_workspace_id());
ALTER TABLE membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership FORCE ROW LEVEL SECURITY;
CREATE POLICY scoped_members ON membership USING(workspace_id=current_workspace_id()) WITH CHECK(workspace_id=current_workspace_id());
-- Workspace enumeration/authorization is a restricted identity repository. Do not expose
-- generic workspace/membership queries. Worker reconciliation uses a dedicated audited role.
-- Production grants must deny UPDATE/DELETE on source_document, notice_revision and audit_event.
-- Invitation persistence and provider-specific configuration
-- belong in reviewed integration migrations; Clerk owns actual invitation lifecycle.
COMMIT;

-- Each listing query pins category; subtype and organization tags are independent.
CREATE INDEX asset_category_type_idx ON asset(category,asset_type);

COMMENT ON COLUMN saved_search.filter IS 'Version 3 typed Boolean groups and terms; service validates structure, counts, scope and values before storage.';
