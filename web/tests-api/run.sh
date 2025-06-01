#!/bin/bash

source $(dirname $0)/credentials.sh

if [[ -z "$access_token" || -z "$refresh_token" || -z "$user_id" ]]; then
  echo "Error: access_token, refresh_token, or user_id is not set."
  exit 1
fi

if [[ -z "$GCP_PRODUCTION_API_KEY" ]]; then
  has_gcp_key=0
else
  has_gcp_key=1
fi

echo "GCP_PRODUCTION_API_KEY is set: $has_gcp_key"

npx stepci run $(dirname $0)/*.yml --env origin="http://localhost:5173" --secret has_gcp_key=$has_gcp_key access_token="$access_token" refresh_token="$refresh_token" user_id="$user_id" "$@"

