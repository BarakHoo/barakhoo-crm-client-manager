#!/bin/sh
# wait-for-db.sh - wait for MySQL to be available then start the Spring Boot app
set -e

DB_HOST=${DB_HOST:-db}
DB_PORT=${DB_PORT:-3306}
TIMEOUT=${DB_TIMEOUT:-60}

echo "Waiting up to ${TIMEOUT}s for database ${DB_HOST}:${DB_PORT}..."

start_ts=$(date +%s)
while ! nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
  now_ts=$(date +%s)
  if [ $((now_ts - start_ts)) -ge "$TIMEOUT" ]; then
	echo "Timed out waiting for database"
	exit 1
  fi
done

echo "Database is available - starting application"
exec java -jar /app/app.jar
