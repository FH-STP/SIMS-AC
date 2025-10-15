
# SIMS - Security Incident Management System

## What is This?

SIMS is a complete system for logging, tracking, and managing IT security incidents. Think of it as a digital logbook for a security team.

The whole thing runs in Docker, which means the entire setup is packed into containers. This makes it easy to run the same environment on any machine, whether you're developing on your own or deploying it to a server.

The project is built with a "microservices" approach, meaning different parts of the application run as separate, independent services that talk to each other.

## What's Included?

This project isn't just a single application; it's a full stack of tools:

-   **The Core App:** A frontend, a .NET API, a SQL database, and a NoSQL database.
    
-   **Automation & AI:** n8n for automating workflows, backed by a Postgres database, plus Ollama and Qdrant for running local AI models.
    
-   **Management & Monitoring:** Grafana for live dashboards and Portainer for easily managing the Docker containers.
    

## Getting Started (The Quick Way)

You only need **Docker** and **Git** installed on your system.

**1. Get the Code** Open your terminal and clone the project:

```
git clone [https://github.com/FH-STP/SIMS-AC.git](https://github.com/FH-STP/SIMS-AC.git)
cd SIMS-AC-main
```

**2. Run the Installer** Make the setup script executable and run it. This one command does everything for you.

```
chmod +x setup_linux.sh
./setup_linux.sh
```

The script will set up all the configurations and start the containers. It might take a few minutes the first time as it downloads everything.


### Services Overview

Once the setup is complete, all services will be running. You can access them at the following URLs:

| Service   | Purpose                         | Access URL                        | Default Credentials |
| :-------- | :------------------------------ | :-------------------------------- | - |
| Frontend  | The main web user interface.    | `http://localhost:8080`           | - |
| API       | The backend logic service.      | `http://localhost:5000`           | - |
| Grafana   | For data visualization.         | `http://localhost:3000`           | admin / admin123! |
| Portainer | For managing Docker containers. | `https://localhost:9443`          | Set on first visit! |
| n8n 			| Workflow automation. 						| `https://localhost:5678`          | Set on first visit. |
| SQL-DB    | MS SQL database.                | `localhost,1433` (via clients)    | sa / YourStrong!SQLPa55word |
| MongoDB   | NoSQL database.                 | `localhost:27017` (via clients)   | simsadmin / YourStrong!MongoPa55word |
| Ollama | LLM Service | `localhost:11434` via n8n Client |


## Troubleshooting

If you get an error like "container name is already in use," it means you have old containers left over from a previous run. To fix this, just run the following command to completely clean your environment before you run the setup script again:

```
docker compose down --volumes

```
