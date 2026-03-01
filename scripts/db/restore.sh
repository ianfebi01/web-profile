#!/bin/bash
if [ -z "$1" ]; then
  echo "Error: Please provide your production MongoDB connection string."
  echo "Usage: ./scripts/db/restore.sh \"mongodb+srv://user:pass@cluster.mongodb.net/test\""
  exit 1
fi

DUMP_DIR="scripts/db/dump"

echo "Restoring database to production from $DUMP_DIR/test ..."
# We use --drop to overwrite existing collections in the target db with the ones from the dump
mongorestore --uri="$1" --drop "$DUMP_DIR/test" --quiet
echo "Restore complete!"
