# Auctions / Remates container workflow

Target: Linux AMD64 (x86-64). Run commands from the frontend directory. Image building is separate from Compose deployment, following the supplied managed-image pattern.

## Build the image

```sh
export FRONTEND_IMAGE_TAG=prototype-2026.11.16
docker build --platform linux/amd64 --pull \
  -t "auctions-frontend:${FRONTEND_IMAGE_TAG}" .
```

Use a release-specific tag. The runtime uses node:24-bookworm-slim, runs as the non-root Node user and listens on container port 3000. NODE_IMAGE can override the approved base image. BUILD_STANDALONE=1 is enabled inside the builder; normal local npm build/start is preserved. Only standalone runtime files, traced dependencies, static assets and public asset files enter the final image.

## Deploy an already-built image

```sh
cp .env.docker.example .env.docker
cp frontend-env.example frontend-env
# Set FRONTEND_IMAGE_TAG in .env.docker to the image tag you built or loaded.
# Set optional runtime values in frontend-env.
docker network inspect traefik
docker compose --env-file .env.docker up -d --no-build
docker compose --env-file .env.docker ps
```

The image must be available to the deployment engine. Compose requires a non-empty FRONTEND_IMAGE_TAG and uses `auctions-frontend:<tag>` with container_name `auctions-frontend`, restart `unless-stopped`, and env_file `frontend-env`. The fixed name assumes one instance per Docker engine and must not collide with an existing container from another system.

The external `traefik` network must already exist. Compose neither creates it nor configures a proxy. Other containers on that network can reach the application at `auctions-frontend:3000`. No host ports, routing labels, domains or TLS settings are included. Integrate routing through the existing infrastructure separately.

This prototype contains only the frontend and its fictional Next.js API routes. It does not add the Spring Boot backend or PostgreSQL network from the example because neither service exists here.

`.env.docker` is Compose image-tag configuration. `frontend-env` is the separate runtime environment file passed into the container; it does not supply Compose image-tag interpolation. Keep both local and out of Git. Only the example files are tracked.

## Runtime health and operations

The image is based on Debian slim, which does not include wget. Health checks therefore use the available Node fetch against `/api/health`: interval 30s, timeout 10s, retries 3, start period 30s. No extra package is needed for health checks.

```sh
docker compose --env-file .env.docker logs --tail 100 auctions-frontend
docker compose --env-file .env.docker exec -T auctions-frontend \
  node -e "fetch('http://127.0.0.1:3000/api/health').then(async r=>{console.log(await r.text());process.exit(r.ok?0:1)}).catch(()=>process.exit(1))"
```

An unhealthy status does not automatically restart a still-running process; restart:unless-stopped handles exited containers. To update, make a new image available, change FRONTEND_IMAGE_TAG and run up -d --no-build again. Stop with `docker compose --env-file .env.docker down`; the external network is not removed. Logs are size-limited.

## Optional Clerk and maps

The default fictional demo needs no credentials. NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, NEXT_PUBLIC_MAP_TILE_URL and NEXT_PUBLIC_MAP_ATTRIBUTION are browser-visible build arguments. Pass any enabled values with --build-arg when building the image. Changing them requires a new build; setting these values in frontend-env alone cannot change the compiled browser assets. The build command above intentionally uses empty defaults for the demo.

CLERK_SECRET_KEY belongs only in runtime frontend-env. Never pass it as a build argument or copy it into image layers. When enabling Clerk, its runtime publishable key must match the key compiled into the image. Credentialed Clerk flows have not been tested.

## Prototype boundaries and validation

All 150 items and notices are fictional. Roles, notes, tags, filters and configuration remain browser-local simulations; image attachments are browser-session previews. There is no shared database. Clerk UI does not replace the unfinished backend authorization.

Standalone build, lint, 24 tests and standalone smoke checks previously passed. Actual Docker build/container/network integration is unverified locally because the installed Podman VM aborts on startup. The updated Compose file has been parsed and its service, required tag, runtime env, health check and external-network settings checked without a running engine. See qa/docker-validation.json for details.
