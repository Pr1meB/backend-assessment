#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting PebbleScore Backend setup..."

if [ ! -f .env ]; then
  echo "Creating .env file from .env.example..."
  cp .env.example .env
fi

echo "Installing dependencies..."
npm install --loglevel=error --no-fund

echo "Starting PostgreSQL database via Docker Compose..."
docker compose up -d

echo "Waiting for PostgreSQL to be ready..."
sleep 3

echo "Pushing database schema..."
npm run db:push

echo "Building the application..."
npm run build

echo "Setup complete! Starting the development server..."
echo "The API will be available at http://localhost:3000"
echo "Swagger documentation will be available at http://localhost:3000/api/docs"


echo "Checking for existing server on port 3000..."
fuser -k 3000/tcp 2>/dev/null || true

npm run start:dev
