# Erkab EdTech Platform — Backup and Disaster Recovery Runbook

This guide details the backup, retention, and disaster recovery procedures for the Erkab EdTech Training Organization platform running on Zergaw Cloud VPS (CS02004: 2 vCPU, 4 GB RAM, 30 GB OS, 25 GB Data).

---

## 1. Architecture & Storage Overview

The Erkab platform stores durable state across two secure systems:
1. **Relational Database**: PostgreSQL (Neon Serverless or Managed PostgreSQL instance). Stores user records, student applications, trainer/mentor profiles, course offerings, announcements, payments, audit logs, and notification records.
2. **Media Storage**: Cloudinary CDN. Stores all uploaded student identification files, portfolio assets, and news announcement multi-image photo slideshows. Cloudinary manages redundancy across global edge storage.
3. **Local Server Storage (25 GB Data Volume)**:
   - `/var/log` & Docker JSON logs (rotated, max 50MB per service).
   - `deployment/backups/`: Encrypted, compressed SQL dumps (`erkab_db_YYYYMMDD_HHMMSS.sql.gz`).
   - SSL certificates (`/etc/letsencrypt`).

---

## 2. Automated Daily Backup (Cron)

On the Ubuntu production server, automate database snapshots every night at 02:00 AM UTC:

```bash
# Open crontab for the deploy user
crontab -e

# Add the daily backup job (with log recording):
0 2 * * * /home/ubuntu/Erkab/deployment/scripts/backup.sh >> /var/log/erkab-backup.log 2>&1
```

The script `deployment/scripts/backup.sh`:
- Connects directly to the PostgreSQL instance using `DIRECT_URL`.
- Performs a consistent, transactional dump with `--clean --if-exists --no-owner --no-privileges`.
- Compresses the output on-the-fly using `gzip` (typical size ~2 MB to 20 MB).
- Saves the file to `deployment/backups/erkab_db_<timestamp>.sql.gz`.
- Automatically prunes backup files older than **14 days** to ensure the 25 GB data disk never runs out of capacity.

---

## 3. Manual Pre-Migration Snapshot

Before applying any code update or running Prisma schema updates, ALWAYS generate a manual snapshot:

```bash
cd /home/ubuntu/Erkab
bash deployment/scripts/backup.sh
```

Confirm that the backup completed successfully:
```bash
ls -lh deployment/backups/
```

---

## 4. Disaster Recovery & Database Restoration

If data corruption, accidental deletion, or a faulty migration occurs:

### Step 1: Identify the Target Backup File
```bash
ls -lt deployment/backups/
```

### Step 2: Temporarily Pause User Traffic
To prevent partial writes while restoring:
```bash
docker compose stop backend erkab-website admin
```

### Step 3: Run the Restoration Script
```bash
bash deployment/scripts/restore.sh deployment/backups/erkab_db_YYYYMMDD_HHMMSS.sql.gz
```
The script will prompt you for explicit confirmation (`yes`) before writing to the database.

### Step 4: Restart Services & Verify Health
```bash
docker compose start backend erkab-website admin
bash deployment/healthchecks/verify-platform.sh
```

---

## 5. Offsite Backup Strategy (Recommended)

To protect against physical VPS failure, replicate the weekly snapshots to an offsite S3-compatible bucket or local backup storage:

```bash
# Example rsync / rclone to offsite storage:
rclone copy /home/ubuntu/Erkab/deployment/backups/ remote:erkab-offsite-backups/
```
