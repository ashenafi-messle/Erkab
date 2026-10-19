#!/usr/bin/env bash
# ==============================================================================
# Erkab EdTech Platform - Production Database Restore Script
# Safely restores a compressed SQL backup into PostgreSQL
# Requires explicit confirmation to prevent accidental data loss
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

if [ $# -lt 1 ]; then
    echo "Usage: $0 <path_to_backup_file.sql.gz>"
    echo "Example: $0 deployment/backups/erkab_db_20261019_120000.sql.gz"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "${BACKUP_FILE}" ]; then
    echo "ERROR: Backup file ${BACKUP_FILE} not found!"
    exit 1
fi

if [ ! -f "${ROOT_DIR}/.env" ]; then
    echo "ERROR: .env file not found."
    exit 1
fi

source "${ROOT_DIR}/.env"

echo "=========================================================="
echo " CAUTION: DATABASE RESTORATION"
echo " Target File: ${BACKUP_FILE}"
echo " Database URL: ${DIRECT_URL:-$DATABASE_URL}"
echo "=========================================================="
read -p "Are you ABSOLUTELY sure you want to overwrite database tables? (yes/no): " CONFIRM

if [ "${CONFIRM}" != "yes" ]; then
    echo "Restoration cancelled by operator."
    exit 0
fi

DB_URL="${DIRECT_URL:-$DATABASE_URL}"

echo "Restoring database..."
if command -v psql &> /dev/null; then
    gunzip -c "${BACKUP_FILE}" | psql "${DB_URL}"
else
    gunzip -c "${BACKUP_FILE}" | docker run --rm -i postgres:16-alpine psql "${DB_URL}"
fi

echo "Database restoration completed successfully."
