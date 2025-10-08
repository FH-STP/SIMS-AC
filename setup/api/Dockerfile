# Use the official Microsoft ASP.NET runtime as a base image.
# This provides a standardized, secure, and optimized Linux environment for running .NET applications.
FROM mcr.microsoft.com/dotnet/aspnet:8.0

# Set the working directory inside the container to /app.
# This is where your application files will reside.
WORKDIR /app

# This command is a standard Linux trick to keep the container running indefinitely.
# It "tails" a special file that never ends, which prevents the container from
# successfully completing its task and exiting.
# This is crucial for keeping the container alive so NGINX and other services can connect to it.
CMD ["tail", "-f", "/dev/null"]