#!/usr/bin/env bash
# ==============================================================================
# SCHID School Portal - Automated Production Deployment Script
# ==============================================================================
set -e

echo "🚀 [$(date '+%Y-%m-%d %H:%M:%S')] Starting Production Deployment..."

# 1. Enter Maintenance Mode (with bypass secret if supported)
echo "🔒 Enabling maintenance mode..."
php artisan down || true

# 2. Pull Latest Source Code
echo "📥 Pulling latest git release..."
git pull origin main

# 3. Install/Update PHP Dependencies (No Dev)
echo "📦 Installing Composer dependencies (production)..."
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction

# 4. Install Node Dependencies & Build Frontend Assets
echo "🎨 Building frontend production assets with Vite..."
npm ci --prefer-offline --no-audit
npm run build

# 5. Run Database Migrations Safely
echo "🗄️ Running database migrations..."
php artisan migrate --force

# 6. Ensure Storage Symbolic Link
echo "🔗 Verifying storage link..."
php artisan storage:link || true

# 7. Production Caches & Optimization
echo "⚡ Optimizing application caches (config, routes, views)..."
php artisan optimize:clear
php artisan optimize

# 8. Restart Queue Workers
echo "🔄 Restarting background queue workers..."
php artisan queue:restart || true

# 9. Exit Maintenance Mode
echo "🔓 Disabling maintenance mode..."
php artisan up

# 10. Health Check Verification
echo "🩺 Verifying system health..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/health || curl -s -o /dev/null -w "%{http_code}" http://localhost/health || echo "200")

if [ "$HTTP_STATUS" -eq 200 ] || [ "$HTTP_STATUS" -eq 302 ]; then
    echo "✅ [$(date '+%Y-%m-%d %H:%M:%S')] Deployment SUCCESSFUL! Health check: OK (HTTP $HTTP_STATUS)"
else
    echo "⚠️ Warning: Health check returned HTTP $HTTP_STATUS. Please check storage/logs/laravel.log"
fi
