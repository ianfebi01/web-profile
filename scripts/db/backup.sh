#!/bin/bash
echo "Backing up local database..."

if [ -z "$1" ]; then
  echo "Error: Please provide your production MongoDB connection string."
  echo "Usage: ./scripts/db/backup.sh \"mongodb+srv://user:pass@cluster.mongodb.net/test\""
  exit 1
fi

DB_URI=$1
DUMP_DIR="scripts/db/dump"

echo "Backing up local database to $DUMP_DIR..."
# We can use a different method to supply connection or simply not print it.
# Usually mongodump doesn't print the URI by default anyway, but to be sure we suppress unnecessary error logs that might leak it.
mongodump --uri="$DB_URI" --out="$DUMP_DIR" --quiet
echo "Backup complete! Data saved to $DUMP_DIR"
