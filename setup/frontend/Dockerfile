# Use the lightweight official NGINX image as a base
FROM nginx:alpine

# Copy the frontend files to the NGINX html directory
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/

# Ensure proper permissions
RUN chmod -R 755 /usr/share/nginx/html/
