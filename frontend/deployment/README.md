# Deploy the Auctions / Remates prototype

Target: Linux AMD64 (x86-64), as confirmed by the user. Run commands from the frontend directory. Docker Engine and Docker Compose v2 are prerequisites on the build/deployment host. The Dockerfile also works with a compatible Podman builder.

## Build and run

```sh
cp .env.docker.example .env.docker
docker compose --env-file .env.docker build --pull
docker compose --env-file .env.docker up -d
docker compose --env-file .env.docker ps
curl --fail http://127.0.0.1:8080/api/health
```

The image is tagged `auctions-prototype:latest` by default. It binds port 3000 inside the container and publishes only host loopback port 8080, leaving the development preview on port 3000 available. Change HTTP_PORT in .env.docker if necessary. The image runs as the standard non-root Node user. The Docker builder enables BUILD_STANDALONE=1; regular npm run build/npm start keeps the local preview configuration. Only the standalone server, traced runtime dependencies, static assets and public files are copied into the final stage. Build context allowlisting excludes environment files, credentials, local dependencies, Git history, QA screenshots and old mockups.

To build without Compose:

```sh
docker build --platform linux/amd64 --pull -t auctions-prototype:latest .
docker run -d --name auctions-prototype --init --restart unless-stopped \
  -p 127.0.0.1:8080:3000 auctions-prototype:latest
```

Building AMD64 on Apple Silicon needs a container engine with x86 emulation; alternatively run the build on the AMD64 server itself. The runtime uses the official node:24-bookworm-slim image. NODE_IMAGE is an overridable build argument if your organization pins an approved base digest.

## Public HTTPS with the supplied proxy

Point your DNS hostname to the server. Set PUBLIC_HOST in .env.docker to that real hostname (for example auctions.example.com, without a URL scheme/path). Make TCP 80 and 443 available to the server; UDP 443 is optional HTTP/3. If another proxy already owns those ports, use the existing-proxy instructions below.

```sh
docker compose --env-file .env.docker -f compose.yaml -f compose.public.yaml up -d
docker compose --env-file .env.docker -f compose.yaml -f compose.public.yaml logs --tail 100 caddy
```

Caddy waits for the application health check, requests certificates for PUBLIC_HOST, redirects HTTP to HTTPS and forwards traffic to prototype:3000. Its certificate/configuration directories use named volumes. Keep these volumes during upgrades; do not remove them with `down -v`. Certificate issuance requires correct DNS, reachable ports and access to the certificate authority. No public hostname, certificate or remote deployment is created by these files alone.

URLs after deployment:

- https://YOUR_HOST/es/properties
- https://YOUR_HOST/en/properties
- https://YOUR_HOST/api/health

If your server already has Nginx, Caddy or another HTTPS proxy, run compose.yaml alone and point that proxy at http://127.0.0.1:8080. Preserve the Host and forwarded scheme/address headers. If the proxy is another container, connect it to the Compose network and use prototype:3000 instead. Do not point a proxy container at its own loopback address.

## Transfer the built image

You can build directly on the server, use a container registry, or transfer an image archive:

```sh
docker save auctions-prototype:latest | gzip > deployment/auctions-prototype-linux-amd64.tar.gz
# Transfer that archive, Compose files, deployment/Caddyfile and your server-side .env.docker.
# On the server:
docker load < deployment/auctions-prototype-linux-amd64.tar.gz
docker compose --env-file .env.docker up -d --no-build
```

For HTTPS after loading, include both Compose files and --no-build. No archive is generated until an image has actually been built. Image archives are ignored by Git. No registry upload is performed automatically.

To use a registry, set AUCTIONS_IMAGE to your own registry/repository:tag before building, then push it using your existing credentials. On the server use `docker compose --env-file .env.docker pull prototype` and `up -d --no-build`. Do not use `--pull always` for a locally loaded image tag.

## Optional Clerk and map settings

The default image is the public fictional demo and requires no credentials. NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, NEXT_PUBLIC_MAP_TILE_URL and NEXT_PUBLIC_MAP_ATTRIBUTION are public, build-time arguments. Set them in .env.docker before the Compose build. Changing them requires rebuilding the image. Keep the Clerk publishable key the same at build and runtime. If using the plain docker build command, supply the corresponding --build-arg values explicitly.

CLERK_SECRET_KEY is a runtime-only environment variable; Compose passes it from .env.docker. Never pass it as a build argument, put it in the Dockerfile or commit the private env file. Clerk UI needs both keys and an appropriately configured Clerk application/domain. The plain docker run example needs --env-file .env.docker when enabling Clerk. No private keys were supplied or tested.

## Prototype boundaries

All 150 auction items and notices are fictional. Organization roles, SYSADMIN, notes, tags, saved filters and configuration are browser-local simulations. Images are browser session previews and are not uploaded to server storage. Visitors do not share this browser state, and changing domains creates a separate browser-storage origin. There is no PostgreSQL/Spring backend or shared user database in this image. Enabling Clerk UI does not turn the demo roles into backend authorization; the fixture APIs remain public. Use this deployment for fictional demonstration data only.

## Verify and operate

```sh
docker image inspect auctions-prototype:latest --format '{{.Os}}/{{.Architecture}}'
docker compose --env-file .env.docker logs --tail 100 prototype
PREVIEW_TEST_URL=http://127.0.0.1:8080 node scripts/smoke-deployment.mjs
```

The smoke script checks /api/health, Spanish/English pages, their CSS/JavaScript, fonts/logo and paginated API/detail responses in all three categories. It needs Node.js 20.9+ on the machine running the check. The image has its own health check using Node fetch. Docker marks an unhealthy process but restart:unless-stopped restarts only exited containers; it does not by itself restart an unhealthy running container.

Rebuild, then `up -d` to apply application changes. Stop with `docker compose --env-file .env.docker down` (include both files for the HTTPS setup). Public container logs are size-limited. The application has no server-side business-data volume to back up. Keep Caddy certificate volumes when using HTTPS.

## Validation in this workspace

The Next.js standalone build, lint, 24 tests and isolated standalone deployment smoke checks passed on macOS. Docker image/container and HTTPS checks could not run: the installed Podman libkrun VM aborts on startup (`krunkit ... abort trap`). No AMD64 image, image archive or public deployment has been produced yet. Run the build on a working Docker engine or on the target AMD64 host. See qa/docker-validation.json for the exact validation status.

References: [Next.js standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output), [official Node image](https://github.com/nodejs/docker-node), [official Caddy image](https://hub.docker.com/_/caddy).
