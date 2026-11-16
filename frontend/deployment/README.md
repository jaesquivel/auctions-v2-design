# Run the Auctions / Remates prototype with Docker

Target: Linux AMD64 (x86-64). Run the following commands from the frontend directory using Docker Engine and Docker Compose v2, or a compatible Podman builder.

## Build and run

```sh
cp .env.docker.example .env.docker
docker compose --env-file .env.docker build --pull
docker compose --env-file .env.docker up -d
docker compose --env-file .env.docker ps
curl --fail http://127.0.0.1:8080/api/health
```

Open http://127.0.0.1:8080/es/properties or http://127.0.0.1:8080/en/properties. The container uses port 3000 internally; Compose publishes only host loopback port 8080. Change HTTP_PORT in .env.docker if necessary. The development preview on port 3000 can run separately.

To build and run without Compose:

```sh
docker build --platform linux/amd64 --pull -t auctions-prototype:latest .
docker run -d --name auctions-prototype --init --restart unless-stopped \
  -p 127.0.0.1:8080:3000 auctions-prototype:latest
```

Building AMD64 on Apple Silicon needs an engine with x86 emulation. The base image is node:24-bookworm-slim; NODE_IMAGE is an overridable build argument for an approved pinned base image.

## Image contents

The Docker builder enables BUILD_STANDALONE=1. Regular npm run build/npm start preserves the local preview configuration. The final image contains only the standalone server, traced runtime dependencies, static assets and public asset files. It runs as the non-root Node user. The build context excludes environment files, credentials, Git history, local dependencies, QA artifacts and old mockups.

## Optional Clerk and map settings

The default fictional demo requires no credentials. NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, NEXT_PUBLIC_MAP_TILE_URL and NEXT_PUBLIC_MAP_ATTRIBUTION are browser-visible build arguments. Set them in .env.docker before building; changing them requires rebuilding the image. Keep the Clerk publishable key the same at build and runtime. For the plain docker build command, supply the corresponding --build-arg values explicitly.

CLERK_SECRET_KEY is runtime-only; Compose passes it from .env.docker. Never pass it as a build argument, put it in the Dockerfile or commit the private env file. The plain docker run example needs --env-file .env.docker when enabling Clerk. Credentialed Clerk flows have not been tested.

## Prototype data

All 150 items and notices are fictional. Roles, notes, tags, saved filters and configuration are browser-local simulations. Images are browser-session previews and are not uploaded. The image has no PostgreSQL/Spring backend or shared business-data store. Clerk UI does not replace the unfinished backend authorization.

## Verify and manage

```sh
docker image inspect auctions-prototype:latest --format '{{.Os}}/{{.Architecture}}'
docker compose --env-file .env.docker logs --tail 100 prototype
PREVIEW_TEST_URL=http://127.0.0.1:8080 node scripts/smoke-deployment.mjs
```

The smoke script needs Node.js 20.9+ and checks health, both languages, CSS/JavaScript, fonts/logo and paginated API/detail responses in all three categories. The image also has a health check using Node fetch. restart:unless-stopped restarts exited containers; it does not automatically restart an unhealthy running process.

Rebuild and run up -d to apply application changes. Stop with:

```sh
docker compose --env-file .env.docker down
```

## Validation

Standalone build, lint, all 24 tests and isolated standalone smoke checks passed. The Docker image itself has not been built locally because the installed Podman VM aborts on startup. Actual image/container validation requires a working engine. See qa/docker-validation.json for details.
