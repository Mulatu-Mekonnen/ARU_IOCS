#!/bin/bash

# ARU IOCS Development Server Launcher
# This script starts both Laravel and Vite dev servers

echo "=================================================="
echo "  ARU Inter-Office Communication System"
echo "  Development Server Startup"
echo "=================================================="
echo ""

# Set working directory
cd /workspaces/ARU---IOCS/laravel-migration

# Kill any existing servers on ports 8000 and 5173
echo "🛑 Cleaning up any existing servers..."
pkill -f "php artisan serve" 2>/dev/null
pkill -f "vite" 2>/dev/null
sleep 1

# Clear config and rebuild database
echo "🔄 Preparing database..."
php artisan config:clear >/dev/null 2>&1
rm -f database/database.sqlite 2>/dev/null
php artisan migrate --force --quiet 2>/dev/null

echo ""
echo "✅ Database ready!"
echo ""

# Start Laravel server
echo "▶️  Starting Laravel Server..."
php artisan serve --host=127.0.0.1 --port=8000 2>&1 | grep -v "Xdebug" &
LARAVEL_PID=$!
sleep 2

# Start Vite dev server
echo "▶️  Starting Vite Dev Server..."
npm run dev 2>&1 | grep -v "Xdebug" &
VITE_PID=$!
sleep 3

echo ""
echo "=================================================="
echo "✨ Servers are running!"
echo "=================================================="
echo ""
echo "📍 Laravel API:    http://localhost:8000"
echo "📍 Vite Dev:       http://localhost:5173"  
echo "📍 Application:    http://localhost:8000"
echo ""
echo "📝 Log file: /tmp/dev-server.log"
echo ""
echo "Press CTRL+C to stop servers"
echo "=================================================="
echo ""

# Wait for both processes
wait $LARAVEL_PID $VITE_PID
