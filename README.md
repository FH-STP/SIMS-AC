
# SIMS Project - Quick Start Guide

This project uses Docker to run a multi-container application for the Security Incident Management System (SIMS). This guide will help you get the entire environment up and running with a single command.

### Prerequisites

Before you begin, you **must** have the following software installed on your system:

1.  **Docker & Docker Compose:**
    
    -   **Windows/macOS:**  [Docker Desktop](https://www.docker.com/products/docker-desktop/ "null") is the easiest way to get both.
        
    -   **Linux:** Install [Docker Engine](https://docs.docker.com/engine/install/ "null") and the [Docker Compose Plugin](https://docs.docker.com/compose/install/ "null").
        
2.  **Git:**
    
    -   Required for cloning the project repository. You can download it from [git-scm.com](https://git-scm.com/downloads "null").
        

### How to Run the Project

**Step 1: Get the Project Files**

First, clone the project repository from GitHub to your local machine:

```
git clone <your-repository-url>
cd <project-folder>

```

**Step 2: Run the Installer**

The installer script will prepare the environment and start all the Docker containers.

-   **On Windows:** Double-click the `setup-and-run.bat` file or run it from your command prompt:
    
    ```
    setup-and-run.bat
    
    ```
    
-   **On Linux or macOS:** First, you need to make the script executable. Then, run it.
    
    ```
    # Make the script executable (only needs to be done once)
    chmod +x setup-and-run.sh
    
    # Run the script
    ./setup-and-run.sh
    
    ```
    

The first time you run the script, Docker will download and build all the necessary images, which may take several minutes.

### Services Overview

Once the setup is complete, all services will be running. You can access them at the following URLs:

| Service   | Purpose                         | Access URL                        |
| :-------- | :------------------------------ | :-------------------------------- |
| Frontend  | The main web user interface.    | `http://localhost:8080`           |
| API       | The backend logic service.      | `http://localhost:5000`           |
| Grafana   | For data visualization.         | `http://localhost:3000`           |
| Portainer | For managing Docker containers. | `https://localhost:9443`          |
| SQL-DB    | MS SQL database.                | `localhost,1433` (via clients)    |
| MongoDB   | NoSQL database.                 | `localhost:27017` (via clients)   |

### How to Reset the Environment

If you need to get a completely fresh installation (for example, to re-run the database setup scripts), navigate to the project directory in your terminal and run:

```
# This stops all containers and deletes all persistent data
docker compose down --volumes

```
