#!/bin/sh

# Migrate database from old name to new name if needed
if [ -f /opt/app/backend/data/pingvin-share.db ] && [ ! -f /opt/app/backend/data/swiss-datashare.db ]; then
    echo "Migrating database from pingvin-share.db to swiss-datashare.db..."
    cp /opt/app/backend/data/pingvin-share.db /opt/app/backend/data/swiss-datashare.db 2>/dev/null || {
        echo "Warning: Could not migrate database (permission issue or mounted volume)"
    }
fi

# Copy default logo to the frontend public folder if it doesn't exist
# Handle permission errors gracefully (e.g., when volume is mounted)
if [ -d /tmp/img ] && [ "$(ls -A /tmp/img 2>/dev/null)" ]; then
    # Only copy if destination is writable (not a read-only mounted volume)
    if [ -w /opt/app/frontend/public/img ] 2>/dev/null; then
        cp -rn /tmp/img/* /opt/app/frontend/public/img/ 2>/dev/null || true
    else
        echo "Note: Skipping image copy (destination may be a mounted volume)"
    fi
fi

if [ "$CADDY_DISABLED" != "true" ]; then
  # Start Caddy
  echo "Starting Caddy..."
  if [ "$TRUST_PROXY" = "true" ]; then
    caddy start --adapter caddyfile --config /opt/app/reverse-proxy/Caddyfile.trust-proxy &
  else
    caddy start --adapter caddyfile --config /opt/app/reverse-proxy/Caddyfile &
  fi
else
  echo "Caddy is disabled. Skipping..."
fi

# Run the frontend server
PORT=3333 HOSTNAME=0.0.0.0 node frontend/server.js &

# Run the backend server
cd backend && npm run prod

# Wait for all processes to finish
wait -n
