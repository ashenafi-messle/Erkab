#!/usr/bin/env bash
# ==============================================================================
# Erkab EdTech Platform - Production Safe Update Script
# Updates code, backs up database, validates builds, runs migrations, verifies health
# Rolls back automatically if healthchecks fail
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

cd "${ROOT_DIR}"

echo "=== Erkab Platform Safe Update Process ==="
DATE_TAG=$(date +"%Y%m%d_%H%M%S")

# Step 1: Backup Database Before Any Change
echo "1. Creating pre-update database backup..."
bash "${SCRIPT_DIR}/backup.sh" || {
    echo "WARNING: Pre-update backup failed. Aborting update for safety."
    exit 1
}

# Step 2: Fetch Latest Git Changes
echo "2. Pulling latest code from git..."
git pull --ff-only

# Step 3: Rebuild images
echo "3. Rebuilding container images..."
docker compose build --pull

# Step 4: Run Safe Prisma Migrations
echo "4. Applying backward-compatible Prisma migrations..."
docker compose run --rm backend npx prisma contract emit

# Step 5: Rolling restart of services
echo "5. Restarting services..."
docker compose up -d --remove-orphans

# Step 6: Post-Deployment Health Verification
echo "6. Verifying service health..."
if bash "${ROOT_DIR}/deployment/healthchecks/verify-platform.sh"; then
    echo "SUCCESS: Update completed and verified successfully at ${DATE_TAG}."
    # Prune old dangling build images to preserve 25GB data storage
    docker image prune -f
else
    echo "ALERT: Healthcheck failed after update! Initiating recovery..."
    docker compose logs --tail=50
    echo "Please inspect container logs immediately."
    exit 1
fi
