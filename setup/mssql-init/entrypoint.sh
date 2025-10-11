#!/bin/bash

# Start the main SQL Server process in the background
/opt/mssql/bin/sqlservr &

# Capture the Process ID (PID) of the SQL Server
SQL_SERVER_PID=$!

# --- Database Initialization ---

# Wait for the SQL Server to be fully ready by polling with sqlcmd.
# We will NOT redirect output so we can see any potential connection errors.
echo "Waiting for SQL Server to accept connections..."
until sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -l 30 -C -Q "SELECT 1"; do
    echo "SQL Server is unavailable - sleeping for 2 seconds..."
    sleep 2
done

echo "SQL Server is up and running. Initializing database..."

# Run the setup script to create the tables and capture the exit code
echo "Running setup.sql to create tables in master..."
sqlcmd \
    -S localhost -U sa -P "$SA_PASSWORD" -d master -C \
    -i setup.sql
SQL_EXIT_CODE=$? # Capture the exit code of the sqlcmd command

# Check if the script ran successfully and report the result
if [ $SQL_EXIT_CODE -eq 0 ]; then
    echo "Database initialization script completed successfully."
else
    echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
    echo "!!! DATABASE SCRIPT FAILED with exit code: $SQL_EXIT_CODE"
    echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
fi

# --- End of Initialization ---

# Bring the SQL Server process back to the foreground. This is the command
# that will keep the container running.
wait $SQL_SERVER_PID
    

