# Auto-Deploy Setup Guide

> TODO: Implement automatic deployment when pushing to main branch.

## Current Setup
- **Repo**: GitHub (TheyCallMeCheng/besugen-c)
- **Server**: Linux at `/root/besugen-c`
- **Process Manager**: pm2 (`besugen-server`)
- **Build**: `pnpm build`
- **Restart**: `pm2 restart besugen-server`

---

## Recommended: GitHub Actions + SSH (FREE)

### 1. Add GitHub Secrets
Go to: Repository Settings > Secrets and variables > Actions

Add these secrets:
| Secret Name | Value |
|-------------|-------|
| `SERVER_HOST` | Your server IP or domain |
| `SERVER_USER` | `root` |
| `SERVER_SSH_KEY` | Your private SSH key (entire content of `~/.ssh/id_rsa`) |

### 2. Create Workflow File
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SERVER_SSH_KEY }}
          script: |
            cd /root/besugen-c
            git pull origin main
            pnpm install
            pnpm build
            pm2 restart besugen-server
```

### 3. Server Requirements
- SSH access enabled
- Git configured (can pull without password)
- pnpm and Node.js installed
- pm2 running

---

## Alternative: Webhook (FREE, no GitHub minutes)

If you prefer not to use GitHub Actions minutes:

### On Server
1. Install webhook: `apt install webhook`
2. Create `/root/deploy-besugen.sh`:
```bash
#!/bin/bash
cd /root/besugen-c
git pull origin main
pnpm install
pnpm build
pm2 restart besugen-server
```
3. Make executable: `chmod +x /root/deploy-besugen.sh`
4. Set up webhook listener on a port (e.g., 9000)

### On GitHub
- Settings > Webhooks > Add webhook
- Point to `http://your-server:9000/hooks/deploy-besugen`

---

## Cost Summary

| Option | Cost |
|--------|------|
| GitHub Actions | Free (2000 min/month for private repos) |
| Webhook | Free (runs on your server) |

---

## Quick Test Checklist
- [ ] Can SSH into server with key (no password)
- [ ] Server can `git pull` without prompts
- [ ] `pnpm build` works on server
- [ ] `pm2 restart besugen-server` works
