# Start with the official, lightweight NGINX image
FROM nginx:alpine

# The base image has a default configuration that we don't need.
# This command removes the default config file.
RUN rm /etc/nginx/conf.d/default.conf

# Now, copy your custom nginx.conf file from the host's ./nginx folder
# into the container's configuration directory. NGINX will automatically
# load this file when it starts.
COPY nginx.conf /etc/nginx/conf.d/

