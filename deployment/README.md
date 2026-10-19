# Erkab EdTech Platform — Production Deployment Guide

Complete operations and deployment guide for the **Erkab EdTech Training Organization Platform** on **Zergaw Cloud** (Package CS02004).

---

## 1. System Architecture & Resource Budget

### Hardware Target
- **VPS Package**: Zergaw Cloud CS02004
- **vCPU**: 2 vCPU
- **RAM**: 4 GB RAM
- **OS Storage**: 30 GB SSD
- **Data Storage**: 25 GB Persistent Volume
- **Network**: Dedicated Public IP, 2 Mbps Uplink / Downlink
- **Operating System**: Ubuntu 24.04 LTS (Noble Numbat)

### Target Hostnames & DNS Mapping
Set up the following `A` records in your DNS management console pointing to your **Zergaw Cloud Dedicated Public IP**:

| Domain Name | Service | Upstream Port | Purpose |
| :--- | :--- | :--- | :--- |
| `www.erkab.org` | Public Website | `erkab-website:3000` | Canonical public student/applicant portal |
| `erkab.org` | Canonical Redirect | 301 Redirect | Redirects to `https://www.erkab.org` |
| `admin.erkab.org` | Admin Portal | `admin:3002` | Super-admin and Sub-admin operational portal |
| `api.erkab.org` | Backend REST API | `backend:5000` | Central Node.js / Prisma API gateway |

### Memory & Process Budget (4 GB RAM Limit)
```
+-----------------------------------------------------------+
| Available Physical RAM: 4096 MB                           |
| Swap Space (Configured): 2048 MB                          |
+-----------------------------------------------------------+
| OS Kernel, Systemd, SSH, Fail2ban, UFW:         ~650 MB   |
| Nginx Reverse Proxy (Keepalive + Gzip):          ~64 MB   |
| Backend API (Node.js + Prisma Engine):          ~350 MB   |
| Public Website (Next.js 16 Standalone):         ~180 MB   |
| Admin Portal (Next.js 16 Standalone):           ~160 MB   |
| Certbot Companion (Periodic Renewal):             ~0 MB   |
+-----------------------------------------------------------+
| Total Expected Active Memory:                  ~1404 MB   |
| Headroom for Traffic Spikes & Page Cache:      ~2692 MB   |
+-----------------------------------------------------------+
```

---

## 2. Server Provisioning on Ubuntu 24.04 LTS

Log into your fresh Zergaw Cloud server via SSH as `root` or an authorized `sudo` user:

### Step 2.1: System Updates & Essential Packages
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git ufw fail2ban ca-certificates gnupg lsb-release htop jq
```

### Step 2.2: Configure 2GB Swap Space
Vital for safety on a 4 GB RAM server:
```bash
sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Step 2.3: Security Hardening (UFW Firewall & Fail2ban)
Only expose SSH (22), HTTP (80), and HTTPS (443):
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP ACME Challenge'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw --force enable
sudo systemctl enable --now fail2ban
```

### Step 2.4: Install Docker Engine & Docker Compose Plugin
```bash
# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Allow non-root execution (optional for standard user)
sudo usermod -aG docker $USER
```

---

## 3. Deployment Workflow

### Step 3.1: Clone the Repository
```bash
cd /home/ubuntu
git clone https://github.com/your-org/Erkab.git
cd Erkab
```

### Step 3.2: Configure Production Environment Variables
```bash
cp .env.example .env
nano .env
```
Fill in the real production secrets:
- `SESSION_SECRET`: Strong 64-char key (`openssl rand -base64 48`)
- `DATABASE_URL` & `DIRECT_URL`: Neon / PostgreSQL connection strings
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `BREVO_SMTP_LOGIN`, `BREVO_SMTP_KEY`, `BREVO_SENDER_EMAIL`

### Step 3.3: Initialize SSL Certificates (Let's Encrypt)
Ensure your DNS records (`erkab.org`, `www.erkab.org`, `admin.erkab.org`, `api.erkab.org`) resolve to the VPS before running:
```bash
chmod +x deployment/scripts/*.sh deployment/healthchecks/*.sh
bash deployment/scripts/init-ssl.sh
```

### Step 3.4: Launch the Platform
```bash
bash deployment/scripts/deploy.sh
```

### Step 3.5: Verify Deployment Health
```bash
bash deployment/healthchecks/verify-platform.sh
```

---

## 4. Updates & Maintenance

### Routine Code Updates
To deploy new commits safely without breaking database integrity:
```bash
cd /home/ubuntu/Erkab
bash deployment/scripts/update.sh
```

The update script automatically:
1. Creates a database snapshot in `deployment/backups/`.
2. Pulls code from Git.
3. Rebuilds Next.js and backend containers.
4. Synchronizes Prisma contracts.
5. Performs rolling container recreation.
6. Verifies all healthcheck endpoints.

### Inspecting Service Logs
```bash
# View aggregated real-time logs:
docker compose logs -f

# View specific service logs:
docker compose logs -f backend
docker compose logs -f erkab-website
docker compose logs -f admin
docker compose logs -f nginx
```

### Checking Resource Usage
```bash
docker stats
```

---

## 5. Production Go / No-Go Checklist

Before public launch, confirm all points below:
- [ ] Dedicated public IP assigned to Zergaw VPS.
- [ ] DNS `A` records for `www.erkab.org`, `erkab.org`, `admin.erkab.org`, `api.erkab.org` propagated.
- [ ] UFW firewall is active (`ufw status` shows only 22, 80, 443).
- [ ] SSL certificates issued and auto-renewing via Certbot.
- [ ] Database credentials verified via `curl http://127.0.0.1:5000/health/ready` (returns `CONNECTED`).
- [ ] Brevo SMTP relay verified via `curl http://127.0.0.1:5000/health/smtp` (returns `CONNECTED`).
- [ ] Cloudinary uploads verified from Admin News and Student Application forms.
- [ ] Initial Super Admin seeded with a secure, rotated production password.
- [ ] Daily backup cron job active in crontab.
- [ ] Swapfile active (`swapon --show`).
