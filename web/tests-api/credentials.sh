#!/bin/bash

BRANCH=$(git symbolic-ref --short HEAD)

if [[ "$BRANCH" == "main" ]]; then
  IS_DEV=0
else
  IS_DEV=1
fi

BASE_URL=$([[ $IS_DEV -eq 1 ]] && echo 'https://dev.matchpointapp.com.ar' || echo 'https://matchpointapp.com.ar')

echo "BRANCH: $BRANCH"
echo "IS_DEV: $IS_DEV"
echo "BASE_URL: $BASE_URL"

EMAIL=$(echo "test-ci-cd@matchpointapp.com.ar")
PASSWORD=$(echo "2unfaxj-23pe-d\$xpkjJ")

if [[ -z "$EMAIL" || -z "$PASSWORD" ]]; then
  echo "Error: EMAIL and PASSWORD environment variables must be set."
  exit 1
fi

# Fetch DATABASE_URL and DATABASE_ANON_KEY from getenv endpoint
env_response=$(curl -s "$BASE_URL/api/v1/env")

DATABASE_URL=$(echo "$env_response" | jq -r '.DATABASE_ENDPOINT')
DATABASE_ANON_KEY=$(echo "$env_response" | jq -r '.DATABASE_ANON_KEY')

if [[ -z "$DATABASE_URL" || -z "$DATABASE_ANON_KEY" ]]; then
  echo "Error: Failed to retrieve DATABASE_URL or DATABASE_ANON_KEY."
  exit 1
fi

response=$(curl -s -X 'POST' \
  "$DATABASE_URL""/auth/v1/token?grant_type=password" \
  -H 'accept: application/json' \
  -H "apikey: $DATABASE_ANON_KEY" \
  -H 'Content-Type: application/json' \
  -d "{
  \"email\": \"$EMAIL\",
  \"password\": \"$PASSWORD\"
}")

ACCESS_TOKEN=$(echo "$response" | jq -r '.access_token // empty')
REFRESH_TOKEN=$(echo "$response" | jq -r '.refresh_token // empty')
USER_ID=$(echo "$response" | jq -r '.user.id // empty')

echo "USER ID: $USER_ID"

export access_token="$ACCESS_TOKEN"
export refresh_token="$REFRESH_TOKEN"
export user_id="$USER_ID"
