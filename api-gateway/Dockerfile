FROM nginx:latest
COPY ./nginx/nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]