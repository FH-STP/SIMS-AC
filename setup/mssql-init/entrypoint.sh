#!/bin/bash

# This function runs in the background until the SQL Server is ready.
# It then runs the setup script.
initialize_database() {
    # Wait for 15-20 seconds for the SQL Server to start
    echo "Waiting for SQL Server to start..."
    sleep 20s

    # Run the setup script to create the DB and schema
    # The sqlcmd command is now in the PATH, so we don't need the full path.
    echo "Running setup.sql to initialize the database..."
    sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -d master -i setup.sql
}

# Run the initialization function in the background
initialize_database &

# Start the SQL Server process in the foreground
# This will be the main process of the container
/opt/mssql/bin/sqlservr

