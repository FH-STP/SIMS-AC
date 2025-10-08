# Use the official MS SQL Server image as the base
FROM mcr.microsoft.com/mssql/server:2022-latest

# Switch to the root user to set permissions
USER root

# Create a directory for our setup scripts
WORKDIR /usr/src/app

# Copy our SQL setup script into the container
COPY setup.sql .

# Copy our entrypoint script and make it executable
# This is simpler but relies on the script having correct line endings
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Switch back to the non-root mssql user
USER mssql

# Set the entrypoint to our custom script
CMD ["/bin/bash", "/usr/src/app/entrypoint.sh"]

