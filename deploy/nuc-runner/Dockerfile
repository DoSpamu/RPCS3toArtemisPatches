# Runner image for the PSXPlace monitor (wake-window self-hosted runner).
# Design: docs/superpowers/specs/2026-07-18-nuc-selfhosted-runner-design.md
#
# Build from the REPO ROOT (context must include package*.json):
#   docker build -f deploy/nuc-runner/Dockerfile -t psxplace-runner:latest .
FROM myoung34/github-runner:ubuntu-jammy

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
      xvfb libgtk-3-0 libdbus-glib-1-2 libasound2 libx11-xcb1 libxt6 libpci3 \
      libgl1-mesa-dri libglx-mesa0 libegl-mesa0 mesa-va-drivers mesa-utils \
 && rm -rf /var/lib/apt/lists/*

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
