# Use the official NGINX image
FROM nginx:alpine

# Remove the default NGINX configuration file
RUN rm /etc/nginx/nginx.conf

# Copy your custom configuration file from the nginx folder into the container
COPY nginx.conf /etc/nginx/nginx.conf