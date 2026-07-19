# Runner image for the PSXPlace monitor (wake-window self-hosted runner).
# Design: docs/superpowers/specs/2026-07-18-nuc-selfhosted-runner-design.md
#
# Build from the REPO ROOT (context must include package*.json):
#   docker build -f deploy/nuc-runner/Dockerfile -t psxplace-runner:latest .
#
# Base is ubuntu-noble (24.04): its Mesa (~24.x) supports modern Intel iGPUs;
# jammy's (22.04) Mesa could not initialize this NUC's GPU (llvmpipe fallback,
# eglinfo found no device even as root — diagnosed 2026-07-19).
FROM myoung34/github-runner:ubuntu-noble

# Node 22 via NodeSource — the workflow uses this instead of actions/setup-node.
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
 && apt-get install -y --no-install-recommends nodejs \
 && rm -rf /var/lib/apt/lists/*

# Firefox (Camoufox) runtime libs + Xvfb for headless:'virtual' (Turnstile click).
# Mesa DRI/GLX drivers give Firefox HARDWARE WebGL via the passed-through iGPU
# (compose: devices /dev/dri) — a real "Mesa Intel(R) ..." renderer that
# Cloudflare trusts, vs the "llvmpipe" software string it flags as a bot.
# mesa-utils ships glxinfo for verifying the renderer inside the container.
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
      xvfb libgtk-3-0 libdbus-glib-1-2 libasound2t64 libx11-xcb1 libxt6 libpci3 \
      libgl1-mesa-dri libglx-mesa0 libegl-mesa0 libgbm1 mesa-va-drivers mesa-utils \
 && rm -rf /var/lib/apt/lists/*

# Grant the non-root "runner" user access to the DRI render node. The host's
# renderD128 is group GID 104; docker's group_add doesn't survive the runner
# entrypoint's su, so bake the membership into /etc/group here. (Inside the base
# image GID 104 may already belong to another group — the name is irrelevant,
# only the numeric GID must match the host device's group.)
RUN if ! getent group 104 >/dev/null; then groupadd -g 104 render; fi \
 && usermod -aG "$(getent group 104 | cut -d: -f1)" runner

# Bake the Camoufox browser and warm the npm cache for the "runner" user
# (with RUN_AS_ROOT=false the job runs as "runner"; caches are read from its HOME).
# "npx camoufox fetch" in the workflow is then a no-op until a newer Camoufox
# build is released — at which point the job downloads it (self-healing) and the
# ~200 MB download in the run log is the signal to rebuild this image.
COPY package.json package-lock.json /tmp/bake/
RUN chown -R runner:runner /tmp/bake
USER runner
RUN cd /tmp/bake \
 && HOME=/home/runner npm ci --no-audit --no-fund \
 && HOME=/home/runner npx camoufox fetch \
 && rm -rf /tmp/bake
USER root
