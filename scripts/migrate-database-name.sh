#!/bin/sh
# Script to migrate database from pingvin-share.db to swiss-datashare.db

DATA_DIR="${DATA_DIRECTORY:-./backend/data}"
OLD_DB="$DATA_DIR/pingvin-share.db"
NEW_DB="$DATA_DIR/swiss-datashare.db"

if [ -f "$OLD_DB" ] && [ ! -f "$NEW_DB" ]; then
    echo "Migrating database from pingvin-share.db to swiss-datashare.db..."
    cp "$OLD_DB" "$NEW_DB"
    echo "✓ Database copied to new name"
    echo "Note: Old database file still exists at $OLD_DB"
    echo "You can delete it manually if you want: rm $OLD_DB"
elif [ -f "$OLD_DB" ] && [ -f "$NEW_DB" ]; then
    echo "Both old and new database files exist."
    echo "Old: $OLD_DB"
    echo "New: $NEW_DB"
    echo "Using new database file (swiss-datashare.db)"
elif [ ! -f "$OLD_DB" ]; then
    echo "No old database file found. New database will be created automatically."
fi

