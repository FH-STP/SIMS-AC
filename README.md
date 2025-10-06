
# SIMS - Security Incident Management System

Welcome to the SIMS project! This application provides a full-stack environment for managing IT security incidents, all containerized with Docker.

## Getting Started

To get the entire application stack running on your local machine, please follow the instructions for your operating system. All services are accessed through a single entry point.

### On Windows

1.  Make sure you have Docker Desktop installed and running.
    
2.  Simply double-click and run the `setup-and-run.bat` file.
    

### On Linux / macOS

1.  Make sure you have Docker and Docker Compose installed and running.
    
2.  Open a terminal in the project's root directory.
    
3.  Make the setup script executable: `chmod +x setup-and-run.sh`
    
4.  Run the script: `./setup-and-run.sh`
    

## Accessing Services via NGINX

Once the containers are running, you can access the different parts of the system using the following URLs. All traffic is routed securely through the NGINX reverse proxy.

-   **Main Web Application**: [http://localhost/](https://www.google.com/search?q=http://localhost/ "null")
    
    -   This is the main user interface for the Security Incident Management System.
        
-   **API Endpoint**: `http://localhost/api/`
    
    -   The backend logic is available under this path.
        
-   **Grafana (Visualization)**: [http://localhost/grafana/](https://www.google.com/search?q=http://localhost/grafana/ "null")
    
    -   Used for creating dashboards to visualize incident data.
        
    -   **Default Login**: `admin` / `admin` (you will be prompted to change this on first login).
        
-   **Portainer (Container Management)**: [http://localhost/portainer/](https://www.google.com/search?q=http://localhost/portainer/ "null")
    
    -   A graphical interface to see and manage your running Docker containers.
        
    -   On your first visit, you will need to create an `admin` user and password. When asked, select the **"Docker"** environment to manage.
        

## Stopping the Application

To stop all running containers, open a terminal in the project directory and run:

```
docker-compose down

```
