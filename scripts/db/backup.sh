#!/bin/bash
echo "Backing up local database..."
# Load environment variables
if [ -f .env.local ]; then
  source .env.local
fi

if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set. Please set it in your environment or .env.local file."
  exit 1
fi
DB_URI=$DATABASE_URL
DUMP_DIR="scripts/db/dump"

echo "Backing up local database to $DUMP_DIR..."
# We can use a different method to supply connection or simply not print it.
# Usually mongodump doesn't print the URI by default anyway, but to be sure we suppress unnecessary error logs that might leak it.
mongodump --uri="$DB_URI" --out="$DUMP_DIR" --quiet
echo "Backup complete! Data saved to $DUMP_DIR/test"
