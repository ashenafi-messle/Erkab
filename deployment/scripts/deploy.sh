#!/usr/bin/env bash
# ==============================================================================
# Erkab EdTech Platform - Production Deployment Script
# Target: Ubuntu 24.04 LTS on Zergaw Cloud (CS02004: 2 vCPU / 4 GB RAM)
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

cd "${ROOT_DIR}"

echo "=========================================================="
echo " Starting Erkab Production Deployment"
echo "=========================================================="

# 1. Environment Verification
if [ ! -f ".env" ]; then
    echo "ERROR: .env file does not exist. Please copy .env.example to .env and configure credentials."
    exit 1
fi

# 2. System Resource Verification
TOTAL_MEM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
TOTAL_MEM_MB=$((TOTAL_MEM_KB / 1024))
echo "Detected System Memory: ${TOTAL_MEM_MB} MB"

if [ "${TOTAL_MEM_MB}" -lt 3500 ]; then
    echo "WARNING: System memory is under 4GB. Ensuring swapfile is configured..."
    if [ ! -f /swapfile ]; then
        echo "Creating 2GB swapfile for system stability..."
        sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
        sudo chmod 600 /swapfile
        sudo mkswap /swapfile
        sudo swapon /swapfile
        echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    fi
fi

# 3. Build Production Container Images
echo "Building production Docker images with resource constraints..."
docker compose build --parallel

# 4. Initialize Database & Safe Migrations (Non-destructive)
echo "Running safe Prisma contract migration check..."
docker compose run --rm backend npx prisma contract emit

# 5. Launch All Services
echo "Launching platform container cluster..."
docker compose up -d

# 6. Verify Service Health
echo "Waiting for healthchecks to report healthy..."
bash "${ROOT_DIR}/deployment/healthchecks/verify-platform.sh"

echo "=========================================================="
echo " Erkab Platform is LIVE and HEALTHY on Production!"
echo " Public Website: https://www.erkab.org"
echo " Admin Portal:   https://admin.erkab.org"
echo " API Endpoint:   https://api.erkab.org"
echo "=========================================================="
