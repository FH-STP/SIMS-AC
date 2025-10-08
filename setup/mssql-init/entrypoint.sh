#!/bin/bash
# Start the SQL Server in the background
/opt/mssql/bin/sqlservr &

# Wait for the SQL Server to start. A simple sleep is often enough for initialization.
# For production, a more robust health check loop would be better.
echo "Waiting 20 seconds for SQL Server to start up..."
sleep 20s

# Run the setup script to create the DB and schema
echo "Running setup.sql script..."
/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -d master -i setup.sql

# Now, keep the container running
wait
