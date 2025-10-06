# SIMS - Security Incident Management System

Welcome to the SIMS project! This application provides a full-stack environment for managing IT security incidents, all containerized with Docker.

## Getting Started

To get the entire application stack running on your local machine, please follow the instructions for your operating system.

### On Windows

1.  Make sure you have Docker Desktop installed and running.
    
2.  Simply double-click and run the `setup-and-run.bat` file.
    

A terminal window will open, create the necessary project structure, and start all the Docker containers.

### On Linux / macOS

1.  Make sure you have Docker and Docker Compose installed and running.
    
2.  Open a terminal in the project's root directory.
    
3.  First, make the setup script executable by running the following command:
    
    ```
    chmod +x setup-and-run.sh
    
    ```
    
4.  Now, run the script:
    
    ```
    ./setup-and-run.sh
    
    ```
    

## What the Script Does

The setup script automates the entire environment setup:

1.  **Creates the Directory Structure**: It builds the `api`, `frontend`, `nginx`, and `data` folders.
    
2.  **Generates an `.env` file**: It creates a default `.env` file with placeholder credentials for the databases.
    
3.  **Starts the Application**: It runs `docker-compose up --build`, which builds and starts all the necessary containers.
    

## Accessing the Application

Once the containers are running, you can access the web application by navigating to the following URL in your browser:

[http://localhost](https://www.google.com/search?q=http://localhost "null")

## Stopping the Application

To stop all running containers, open a terminal in the project directory and run:

```
docker-compose down

```
