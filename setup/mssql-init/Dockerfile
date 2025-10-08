# Use the official MS SQL Server image as the base
FROM mcr.microsoft.com/mssql/server:2022-latest

# Switch to the root user to install necessary tools
USER root

# Install dependencies and add the Microsoft package repository for UBUNTU 22.04.
# This is a more robust method to prevent build failures.
RUN apt-get update && \
    apt-get install -y gnupg2 curl lsb-release && \
    curl -sSL https://packages.microsoft.com/keys/microsoft.asc | apt-key add - && \
    # THIS IS THE CORRECTED LINE FOR UBUNTU 22.04
    curl -sSL https://packages.microsoft.com/config/ubuntu/22.04/prod.list > /etc/apt/sources.list.d/mssql-release.list && \
    apt-get update && \
    ACCEPT_EULA=Y DEBIAN_FRONTEND=noninteractive apt-get install -y mssql-tools18 unixodbc-dev

# Add mssql-tools to the PATH, so 'sqlcmd' can be called directly.
ENV PATH="/opt/mssql-tools18/bin:${PATH}"

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
