#!/usr/bin/env bash
set -euo pipefail

cd /var/www/clippy

echo "Pulling latest changes..."
git pull origin main

echo "Installing dependencies..."
npm install --production

echo "Restarting clippy service..."
sudo systemctl restart clippy.service

echo "Deploy complete. Service status:"
sudo systemctl is-active clippy.service
