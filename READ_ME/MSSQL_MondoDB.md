
# MongoDB - NoSQL Database

## What is its Role?

MongoDB is our NoSQL database. In SIMS it's used as a way to store the profile pictures of users and provide further linking between the API and MSSQL.    

## How it Works

The setup is automated. The `mongo-db` service in the `docker-compose.yml` file uses the official `mongo` image. When it starts for the first time, it will automatically run any `.js` or `.sh` scripts it finds in this directory to initialize the database, such as creating collections or inserting default data.

## How to Connect

You can connect to the database from a client like MongoDB Compass using the following details:

-   **Host:**  `localhost`
    
-   **Port:**  `27017`
    
-   **Authentication:** Use the `MONGO_USER` and `MONGO_PASSWORD` from your `.env` file.
