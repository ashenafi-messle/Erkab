#!/usr/bin/env bash
# ==============================================================================
# Erkab EdTech Platform - Production Database Backup Script
# Creates a compressed, encrypted-ready snapshot of PostgreSQL
# Automatically rotates backups older than 14 days to conserve disk space
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

BACKUP_DIR="${ROOT_DIR}/deployment/backups"
mkdir -p "${BACKUP_DIR}"

if [ ! -f "${ROOT_DIR}/.env" ]; then
    echo "ERROR: .env file not found."
    exit 1
fi

source "${ROOT_DIR}/.env"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/erkab_db_${TIMESTAMP}.sql.gz"

echo "=== Starting Erkab Database Backup [${TIMESTAMP}] ==="

# Use DIRECT_URL (bypasses transaction pooler for clean dump) or fallback to DATABASE_URL
DB_URL="${DIRECT_URL:-$DATABASE_URL}"

# Use Docker postgres container or host pg_dump
if command -v pg_dump &> /dev/null; then
    echo "Dumping database using host pg_dump..."
    pg_dump "${DB_URL}" --clean --if-exists --no-owner --no-privileges | gzip > "${BACKUP_FILE}"
else
    echo "Dumping database using temporary docker container..."
    docker run --rm -i postgres:16-alpine pg_dump "${DB_URL}" --clean --if-exists --no-owner --no-privileges | gzip > "${BACKUP_FILE}"
fi

BACKUP_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "Backup successfully created: ${BACKUP_FILE} (Size: ${BACKUP_SIZE})"

# Retain only the last 14 backups to prevent disk exhaustion on 25GB data volume
echo "Rotating backups older than 14 days..."
find "${BACKUP_DIR}" -name "erkab_db_*.sql.gz" -mtime +14 -delete || true

echo "=== Backup Process Complete ==="
