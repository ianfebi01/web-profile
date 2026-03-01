#!/bin/bash
if [ -z "$1" ]; then
  echo "Error: Please provide your production MongoDB connection string."
  echo "Usage: ./scripts/db/restore.sh \"mongodb+srv://user:pass@cluster.mongodb.net/test\" [FROM_DB] [TO_DB]"
  exit 1
fi

DUMP_DIR="scripts/db/dump"

URI="$1"
FROM_DB="$2"
TO_DB="$3"

if [ -n "$FROM_DB" ] && [ -n "$TO_DB" ]; then
  echo "Restoring database to production from $DUMP_DIR/$FROM_DB, mapping collections to '$TO_DB'..."
  # By pointing directly to the specific database directory, mongorestore will import those files directly into the database defined in the URI.
  mongorestore --uri="$URI" --drop "$DUMP_DIR/$FROM_DB"
else
  echo "Restoring database to production from $DUMP_DIR ..."
  # We use --drop to overwrite existing collections in the target db with the ones from the dump
  mongorestore --uri="$URI" --drop "$DUMP_DIR"
fi
echo "Restore complete!"
