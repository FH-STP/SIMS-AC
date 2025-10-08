# Use the official MS SQL Server image as the base
FROM mcr.microsoft.com/mssql/server:2022-latest

# Switch to the root user to install necessary tools
USER root

# Install the mssql-tools package, which provides the sqlcmd utility.
# This follows the official Microsoft installation guide.
RUN apt-get update && \
    apt-get install -y curl apt-transport-https && \
    curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    curl https://packages.microsoft.com/config/ubuntu/20.04/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && \
    ACCEPT_EULA=Y apt-get install -y mssql-tools

# Create a directory for our setup scripts
WORKDIR /usr/src/app

# Copy our SQL setup script and entrypoint into the container
COPY setup.sql .
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Switch back to the non-root mssql user
USER mssql

# Set the entrypoint to our custom script
CMD ["/bin/bash", "/usr/src/app/entrypoint.sh"]
