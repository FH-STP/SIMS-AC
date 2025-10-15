# Grafana - Monitoring & Visualization

## What is This?

Grafana is a tool for creating live dashboards to visualize data. In this project, it's set up to connect to the MS SQL database to give you a real-time overview of your security incidents.

## How it Works

The setup is fully automated. When the Grafana container starts, it uses the configuration files in this directory to:

1.  **Automatically connect** to the `sql-db` service as a data source.
    
2.  **Automatically import** a pre-built "SIMS Overview Dashboard" so you have a starting point for your visualizations.
    

## Accessing Grafana

1.  Open your browser and go to **`http://localhost:3000`**.
    
2.  Log in with the default credentials:
    
    -   **User:**  `admin`
        
    -   **Password:**  `admin` (You'll be asked to set a new password on your first login).
        

Once you're logged in, the "SIMS Overview Dashboard" will be available on the home page.
