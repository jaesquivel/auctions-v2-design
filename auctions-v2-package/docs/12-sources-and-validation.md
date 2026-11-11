# Sources and validation boundaries

## Project evidence

Current user request, dated 4 November 2026 in America/Costa_Rica, is the controlling scope. The referenced chat 6aeb9739-aacc-83e8-bab8-4eaa33e45755 supplied a scope handoff only and no attachments. The user subsequently confirmed that the shared multi-country software must run one configured country per instance, without user or administrator selection. This clarification supersedes the original selectable country concept. A further confirmed requirement makes organization membership mandatory for every user, including solo users; personal-workspace and individual-billing concepts are superseded. C11 confirms exactly ADMIN, MANAGER and USER: ADMIN edits all organization settings/users, MANAGER edits operational settings such as available tags; the previous role model is superseded. C12 adds SYSADMIN for system configuration and operations, modeled separately from the three organization membership roles while preserving fixed-country and mandatory-organization requirements. C13 removes saved/favorite auction items in favor of direct tagging. C14 explicitly keeps saved searches and makes them user-owned, with organization context used for execution only. C15 removes images from auction lists and adds an organization-member Images attachment tab on detail. The project directory was empty when initially inspected. No prior brand, price, source agreements or implementation decisions have been inferred.

## Official sources consulted

These references inform the proposed design, not a claim of production implementation. Reviewed 4 November 2026. Dynamic documentation must be rechecked when pinning dependency versions.

| Source | Use and limitation |
| --- | --- |
| [Costa Rican SINALEVI article 157](https://www.pgrweb.go.cr/DOCS/NORMAS/1/VIGENTE/L/2010-2019/2015-2019/2016/13DD0/149EA8.HTML) | Supports modeling published bases, event schedules and asset description/evidence. Only this article was consulted; no legal eligibility or title conclusion is made |
| [Next.js authentication guide](https://nextjs.org/docs/app/guides/authentication) | Supports authorization near data access and restricted DTOs; framework setup remains future work |
| [Clerk authenticated requests](https://clerk.com/docs/guides/development/making-requests) | Session token handling between frontend and backend |
| [Clerk session tokens](https://clerk.com/docs/guides/sessions/session-tokens) | Claims and validation integration boundary; test selected token version |
| [Clerk authorization checks](https://clerk.com/docs/guides/secure/authorization-checks) | Custom permission and active organization considerations; do not assume every system permission exists in token claims |
| [Clerk organizations overview](https://clerk.com/docs/guides/organizations/overview) | Active organization context and multi-tenant membership model |
| [Spring Boot OAuth2 resource server](https://docs.spring.io/spring-boot/reference/security/oauth2.html) | Proposed issuer/JWKS and optional audience validation configuration |
| [PostgreSQL row security](https://www.postgresql.org/docs/17/ddl-rowsecurity.html) | Defense-in-depth tenant isolation and privileged-role caveats; SQL is a design scaffold |

The [Boletín Judicial endpoint](https://www.imprentanacional.go.cr/boletin/) returned 403 during reference retrieval. Its downloadable samples, access rights, document layouts and automation terms were not validated. No access restriction was bypassed. Establish an approved source mechanism before implementing a connector. The package does not embed real notices or personal data.

## Validation interpretation

The package validation report identifies checks actually run. Proposed performance, accessibility, source accuracy, legal/privacy, production security and recovery targets are future acceptance gates. Fictional fixtures prove interface and contract consistency only. Neither reviewed extraction nor public-source availability constitutes a guarantee of auction occurrence, title quality, completeness or investment suitability.
