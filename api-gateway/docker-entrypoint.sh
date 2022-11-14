#!/usr/bin/env sh
set -eu

envsubst '${payment_service_url_internal} ${bidding_service_url_internal} ${auth_service_url_internal} ${product_service_url_internal}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec "$@"