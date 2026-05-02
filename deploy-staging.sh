#!/bin/bash
set -e
sudo su
REPO="/home/ubuntu/workforce"

echo "📁 Repo path: $REPO"

git config --global --add safe.directory "$REPO"

cd "$REPO"

echo "📥 Fetching latest code..."
git fetch origin main
git reset --hard origin/main

echo "🔨 Applying database migrations..."
bun install
bun db:generate
bun db:deploy

echo "🔨 Pulling and starting Docker containers..."
export COMPOSE_BAKE=true
docker compose pull && docker compose up -d

echo "⏳ Waiting 30 seconds for containers to stabilize..."
sleep 30

echo "🧹 Cleaning up unused Docker resources..."
docker system prune -a --volumes -f

echo "✅ Deployment complete."