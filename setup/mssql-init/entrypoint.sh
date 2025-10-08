#!/bin/bash

# This function runs in the background until the SQL Server is ready.
# It then runs the setup script.
initialize_database() {
    # Wait for 15-20 seconds for the SQL Server to start
    echo "Waiting for SQL Server to start..."
    sleep 20s

    # Run the setup script to create the DB and schema
    echo "Running setup.sql to initialize the database..."
    /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -d master -i setup.sql
}

# Run the initialization function in the background
initialize_database &

# Start the SQL Server process in the foreground
# This will be the main process of the container
/opt/mssql/bin/sqlservr
```

### ⚠️ **Crucial Next Step: Fixing Line Endings**

After you replace the content of your old `entrypoint.sh` with the code above, you **must** ensure it is saved with Linux-style line endings (`LF`).

If you are using a code editor like **Visual Studio Code**, you can easily change this in the bottom-right corner of the status bar. Click on `CRLF` and change it to `LF`.



### What to Do Now

1.  Replace the code in your `setup/mssql-init/entrypoint.sh` file with the new version above.
2.  Ensure the file is saved with `LF` line endings.
3.  Run the following commands in your terminal to get a fresh start:
    ```bash
    # This will remove the old, broken containers and data
    docker compose down --volumes

    # This will rebuild the mssql-init image with the new script and start everything
    docker compose up --build -d
    
