# Use the lightweight official NGINX image as a base
FROM nginx:alpine

# To prove that this container is working, this command creates a simple
# HTML file inside the web server's public directory.
# When NGINX routes traffic here, this is the page you will see.
RUN echo '<h1>Frontend is Running!</h1><p>The NGINX reverse proxy is correctly routing traffic to this container.</p>' > /usr/share/nginx/html/index.html

