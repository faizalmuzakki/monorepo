# 2FAuth Local

Local 2FAuth instance running on your Mac.

## Quick Start

```bash
# Start the service
docker compose up -d

# View logs
docker compose logs -f

# Stop the service
docker compose down
```

## Access

Open in browser: **http://localhost:8000**

First user to register becomes admin.

## Import from Server

To import your existing 2FAuth data from your home server:

### Option 1: Copy the entire database

```bash
# Copy database from server
scp your-user@your-server-ip:~/Projects/home-server/2fauth/data/database.sqlite ./data/

# Restart container
docker compose restart
```

### Option 2: Use 2FAuth's built-in import

1. Export from server's 2FAuth web UI (Settings → Export → JSON)
2. Import in local 2FAuth web UI (Settings → Import → JSON)

## Data Location

All data is stored in `./data/` directory:
- `database.sqlite` - Main database
- `storage/` - Icons and files

## Backup

```bash
# Backup database
cp data/database.sqlite data/database.sqlite.backup

# Or use timestamped backup
cp data/database.sqlite "backups/2fauth_$(date +%Y%m%d_%H%M%S).sqlite"
```

## Uninstall

```bash
# Stop and remove container
docker compose down

# Remove data (optional - be careful!)
# rm -rf data/
```
 
