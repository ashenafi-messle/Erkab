#!/usr/bin/env bash
# ==============================================================================
# Erkab EdTech Platform - Let's Encrypt SSL Bootstrap Script
# Target: Ubuntu 24.04 LTS on Zergaw Cloud VPS
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo "=== Erkab SSL Certificate Initialization ==="

if [ ! -f "${ROOT_DIR}/.env" ]; then
    echo "ERROR: ${ROOT_DIR}/.env file not found. Copy .env.example to .env and configure it first."
    exit 1
fi

source "${ROOT_DIR}/.env"

EMAIL="${LETSENCRYPT_EMAIL:-admin@erkab.org}"
DOMAINS=(
    "${WWW_DOMAIN_NAME:-www.erkab.org}"
    "${DOMAIN_NAME:-erkab.org}"
    "${ADMIN_DOMAIN_NAME:-admin.erkab.org}"
    "${API_DOMAIN_NAME:-api.erkab.org}"
)

echo "Target Email: ${EMAIL}"
echo "Target Domains: ${DOMAINS[*]}"

# Step 1: Temporarily enable bootstrap configuration in Nginx
echo "1. Activating Nginx Port 80 Bootstrap virtual host..."
cp "${ROOT_DIR}/deployment/nginx/conf.d/bootstrap.conf.template" "${ROOT_DIR}/deployment/nginx/conf.d/bootstrap.conf"
rm -f "${ROOT_DIR}/deployment/nginx/conf.d/erkab.conf"

# Step 2: Start Nginx container
echo "2. Starting Nginx container to serve ACME challenge..."
docker compose -f "${ROOT_DIR}/compose.yaml" up -d nginx

# Wait for Nginx to become ready
sleep 3

# Step 3: Request certificates via Certbot for each domain
for DOMAIN in "${DOMAINS[@]}"; do
    echo "3. Requesting Let's Encrypt SSL certificate for ${DOMAIN}..."
    docker compose -f "${ROOT_DIR}/compose.yaml" run --rm --entrypoint "\
      certbot certonly --webroot -w /var/www/certbot \
        --email ${EMAIL} \
        -d ${DOMAIN} \
        --agree-tos \
        --non-interactive" certbot || {
        echo "WARNING: Failed to obtain certificate for ${DOMAIN}. Ensure DNS A-record points to this VPS IP."
    }
done

# Step 4: Restore full production HTTPS configuration
echo "4. Restoring full production HTTPS virtual hosts..."
git checkout "${ROOT_DIR}/deployment/nginx/conf.d/erkab.conf" 2>/dev/null || true
rm -f "${ROOT_DIR}/deployment/nginx/conf.d/bootstrap.conf"

# Step 5: Reload Nginx with new certificates
echo "5. Reloading Nginx with active SSL certificates..."
docker compose -f "${ROOT_DIR}/compose.yaml" exec nginx nginx -s reload || docker compose -f "${ROOT_DIR}/compose.yaml" restart nginx

echo "=== SSL Initialization Complete ==="
