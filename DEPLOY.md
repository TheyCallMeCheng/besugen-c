# Deployment Guide

## Deploy Updates

SSH into the server, then:

```bash
cd /root/besugen-c
git pull
pnpm install
pnpm build
pm2 restart besugen-server
```

The frontend updates immediately (nginx serves the new static files from `apps/client/dist/`).
The backend restarts via PM2.

## Useful Commands

```bash
pm2 status                    # check backend process
pm2 logs                      # live backend logs
pm2 logs --lines 50           # last 50 log lines
pm2 restart besugen-server    # restart backend
pm2 stop besugen-server       # stop backend
pm2 start ecosystem.config.cjs  # start backend

nginx -t && systemctl reload nginx  # reload nginx config
certbot renew --dry-run             # test SSL renewal
```

## Environment Files

| File | Purpose |
|------|---------|
| `.env` | Vite build-time vars (`VITE_DISCORD_CLIENT_ID`, `VITE_COLYSEUS_URL`) |
| `apps/server/.env` | Backend runtime vars (`PORT`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`) |

## Discord Activity URL Mappings

| Prefix | Target |
|--------|--------|
| `/` | `https://besugen.com` |
| `/api` | `https://besugen.com` |
