#!/bin/sh
set -e

echo "Running database schema sync..."
/app/packages/db/node_modules/.bin/prisma db push \
  --schema=/app/packages/db/prisma/schema.prisma \
  --accept-data-loss

# Populate the Pulumi deps cache on first boot (or after the volume is wiped).
# The renderer symlinks /pulumi-deps/node_modules into each deploy workdir, so
# without this the very first deploy fails with "Pulumi SDK has not been installed."
PULUMI_DEPS_DIR="${PULUMI_BASE_DEPS_DIR:-/pulumi-deps}"
if [ ! -d "${PULUMI_DEPS_DIR}/node_modules/@pulumi/pulumi" ]; then
  echo "Bootstrapping Pulumi deps in ${PULUMI_DEPS_DIR}..."
  mkdir -p "${PULUMI_DEPS_DIR}"
  cp /app/apps/api/pulumi-deps-package.json "${PULUMI_DEPS_DIR}/package.json"
  cd "${PULUMI_DEPS_DIR}"
  npm install --no-audit --no-fund --loglevel=error
  cd /app
  echo "Pulumi deps installed."
else
  echo "Pulumi deps cache present at ${PULUMI_DEPS_DIR}."
fi

echo "Starting API..."
exec node apps/api/dist/main.js
