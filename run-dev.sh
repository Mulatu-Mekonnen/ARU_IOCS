#!/bin/bash

# Use the system PHP which has MySQL extensions installed
export PHP=/usr/bin/php

# Kill any existing processes
pkill -f "artisan serve"
pkill -f "npm run dev"
sleep 1

# Change to Laravel directory
cd laravel-migration

# Start Laravel server in background
echo "Starting Laravel server on port 8000..."
$PHP artisan serve --host 0.0.0.0 --port 8000 &
LARAVEL_PID=$!

# Start Vite dev server in background
echo "Starting Vite dev server on port 5173..."
npm run dev &
VITE_PID=$!

echo ""
echo "================================"
echo "Development servers started!"
echo "================================"
echo "Laravel: http://0.0.0.0:8000"
echo "Vite:    http://127.0.0.1:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "================================"

# Keep script running
wait
