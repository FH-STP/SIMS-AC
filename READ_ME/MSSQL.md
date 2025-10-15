
# MS SQL Server - Relational Database

## What is its Role?

MS SQL Server is our relational database (RDBMS). It's used to store the core, structured data for the application, where relationships between data are important.

In this project, it's responsible for storing:

-   The `Users` table, with user accounts and roles.
    
-   The `Incidents` table, which is the main log of all security events.
    
-   Other related tables, like `Conclusion_Definitions` and `Incident_Links`.
    

## How it Works

The setup is fully automated. The `sql-db` service in the `docker-compose.yml` file builds a custom Docker image. When this container starts for the first time, it runs the `entrypoint.sh` script, which waits for the database engine to be ready and then executes the `setup.sql` script to create the `SIMS` database and all the necessary tables.

## How to Connect

You can connect to the database from a client like DataGrip or DBeaver using the following details:

-   **Host:**  `localhost`
    
-   **Port:**  `1433`
    
-   **User:**  `sa`
    
-   **Password:** The `SQL_PASSWORD` from your `.env` file.
