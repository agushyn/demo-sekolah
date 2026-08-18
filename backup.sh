#!/usr/bin/env bash
# ==============================================================================
# SCHID School Portal - Automated Daily Backup Script
# ==============================================================================
set -e

BACKUP_DIR="${BACKUP_DIR:-/var/backups/schid}"
DATE=$(date +"%Y%m%d_%H%M%S")
RETENTION_DAYS=7

mkdir -p "${BACKUP_DIR}/database"
mkdir -p "${BACKUP_DIR}/storage"

echo "📦 [$(date '+%Y-%m-%d %H:%M:%S')] Starting automated backup..."

# 1. Database Backup (Auto-detect SQLite or MySQL/MariaDB from .env)
if [ -f "database/database.sqlite" ]; then
    echo "🗄️ Backing up SQLite database..."
    cp database/database.sqlite "${BACKUP_DIR}/database/db_sqlite_${DATE}.sqlite"
    gzip "${BACKUP_DIR}/database/db_sqlite_${DATE}.sqlite"
elif command -v mysqldump &> /dev/null && [ -n "$DB_DATABASE" ]; then
    echo "🗄️ Backing up MySQL database: ${DB_DATABASE}..."
    mysqldump -u "${DB_USERNAME:-root}" -p"${DB_PASSWORD}" "${DB_DATABASE}" | gzip > "${BACKUP_DIR}/database/db_${DB_DATABASE}_${DATE}.sql.gz"
fi

# 2. Uploaded Storage Assets Backup (excluding cache/logs)
if [ -d "storage/app/public" ]; then
    echo "📁 Backing up public uploads storage..."
    tar -czf "${BACKUP_DIR}/storage/storage_public_${DATE}.tar.gz" -C storage/app public
fi

# 3. Retention Cleanup (Remove backups older than RETENTION_DAYS)
echo "🧹 Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}/database" -type f -name "*.gz" -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true
find "${BACKUP_DIR}/storage" -type f -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete 2>/dev/null || true

echo "✅ [$(date '+%Y-%m-%d %H:%M:%S')] Backup completed successfully to ${BACKUP_DIR}!"
