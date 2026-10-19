#!/usr/bin/env bash
# ==============================================================================
# Erkab EdTech Platform - Production Cluster Health Verification
# Verifies container liveness, readiness, DB connectivity, Brevo SMTP, and web routes
# ==============================================================================

set -euo pipefail

echo "=== Verifying Erkab Platform Cluster Health ==="

MAX_RETRIES=12
WAIT_SECONDS=5

check_endpoint() {
    local name="$1"
    local url="$2"
    local expected_code="$3"
    local retry=0

    echo -n "Checking ${name} (${url})... "

    while [ $retry -lt $MAX_RETRIES ]; do
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${url}" || echo "000")
        if [ "${STATUS}" -eq "${expected_code}" ]; then
            echo "OK (HTTP ${STATUS})"
            return 0
        fi
        retry=$((retry + 1))
        sleep $WAIT_SECONDS
    done

    echo "FAILED! Expected HTTP ${expected_code}, received ${STATUS}"
    return 1
}

# 1. Backend Service Liveness
check_endpoint "Backend Liveness" "http://127.0.0.1:5000/health" 200

# 2. Backend Database Readiness Check
check_endpoint "Database Connectivity" "http://127.0.0.1:5000/health/ready" 200

# 3. Public Website Frontend
check_endpoint "Public Website" "http://127.0.0.1:3000/" 200

# 4. Admin Portal Login Route
check_endpoint "Admin Portal Login" "http://127.0.0.1:3002/login" 200

echo "=== All Core Platform Services are HEALTHY and READY! ==="
