# If we aren't running as root, just exec the CMD
[ "$(id -u)" -ne 0 ] && exec "$@"

echo "Creating user and group..."

PUID=${PUID:-1000}
PGID=${PGID:-1000}

# Check if the group with PGID exists; if not, create it
if ! getent group swiss-datashare-group > /dev/null 2>&1; then
    addgroup -g "$PGID" swiss-datashare-group
fi

# Check if a user with PUID exists; if not, create it
if ! id -u swiss-datashare > /dev/null 2>&1; then
    if ! getent passwd "$PUID" > /dev/null 2>&1; then
        adduser -u "$PUID" -G swiss-datashare-group swiss-datashare > /dev/null 2>&1
    else
        # If a user with the PUID already exists, use that user
        existing_user=$(getent passwd "$PUID" | cut -d: -f1)
        echo "Using existing user: $existing_user"
    fi
fi

# Create data directories if they don't exist (ignore errors for mounted volumes)
mkdir -p /opt/app/backend/data /opt/app/frontend/public/img 2>/dev/null || true

# Change ownership of directories (ignore errors for mounted volumes)
# Mounted volumes will have host permissions, which is fine
chown -R "${PUID}:${PGID}" /opt/app/backend/data 2>/dev/null || echo "Note: Could not change ownership of /opt/app/backend/data (may be a mounted volume)"
chown -R "${PUID}:${PGID}" /opt/app/frontend/public/img 2>/dev/null || echo "Note: Could not change ownership of /opt/app/frontend/public/img (may be a mounted volume)"

# Switch to the non-root user
exec su-exec "$PUID:$PGID" "$@"