#!/bin/bash

set -e

defined_envs=$(printf '${%s} ' $(env | cut -d= -f1))
template="/etc/nginx/nginx.conf.template"
output_path="/etc/nginx/nginx.conf"

echo "Running envsubst on $template to $output_path with $defined_envs"
envsubst "$defined_envs" < "$template" > "$output_path"

echo "$(cat /etc/nginx/nginx.conf)"

exit 0