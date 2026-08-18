#!/usr/bin/env bash
# ==============================================================================
# SCHID School Portal - Backup Restore & Verification Script
# ==============================================================================
set -e

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <path_to_db_backup.gz> [path_to_storage_backup.tar.gz]"
    echo "Example: ./restore.sh /var/backups/schid/database/db_20260816.sql.gz /var/backups/schid/storage/storage_20260816.tar.gz"
    exit 1
fi

DB_BACKUP_FILE="$1"
STORAGE_BACKUP_FILE="$2"

echo "⚠️  WARNING: Restoring backup will overwrite existing database records!"
read -p "Are you sure you want to proceed? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Restore cancelled."
    exit 0
fi

# 1. Restore Database
echo "🗄️ Restoring database from ${DB_BACKUP_FILE}..."
if [[ "$DB_BACKUP_FILE" == *".sqlite.gz" ]]; then
    gunzip -c "$DB_BACKUP_FILE" > database/database.sqlite
elif [[ "$DB_BACKUP_FILE" == *".sql.gz" ]]; then
    gunzip -c "$DB_BACKUP_FILE" | mysql -u "${DB_USERNAME:-root}" -p"${DB_PASSWORD}" "${DB_DATABASE}"
else
    echo "Unknown database backup format."
fi

# 2. Restore Storage Assets
if [ -n "$STORAGE_BACKUP_FILE" ] && [ -f "$STORAGE_BACKUP_FILE" ]; then
    echo "📁 Restoring storage assets from ${STORAGE_BACKUP_FILE}..."
    tar -xzf "$STORAGE_BACKUP_FILE" -C storage/app/
    php artisan storage:link || true
fi

# 3. Clear Caches
php artisan optimize:clear
php artisan optimize

echo "✅ Restore completed successfully! Please perform a smoke test."
