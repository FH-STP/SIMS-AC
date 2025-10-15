
# Automation & AI Stack

This part of the project handles workflow automation and local AI capabilities.

## What's Included?

-   **n8n:** A powerful tool for creating automated workflows. For example, you could set up a workflow to automatically send an email when a new "critical" security incident is created.
    
-   **PostgreSQL:** This is the backend database that n8n uses to save all of its own data, like your workflows and credentials.
    
-   **Ollama:** A service that lets you run large language models (LLMs) like Llama 3 locally on your own machine.
    
-   **Qdrant:** A vector database, which is a special kind of database designed for AI tasks like similarity searches.
    

## How it Works

The setup for this stack is fully automated.

-   **Automatic Setup:** When you run the main `setup_linux.sh` script, a temporary container (`n8n-import`) starts up, waits for the main n8n service to be ready, and then automatically imports all the credentials and workflows you've placed in the `setup/n8n/credentials/` and `setup/n8n/workflows/` folders.
    
-   **Automatic Model Download:** A temporary container (`ollama-pull-llama`) also starts and automatically downloads the `llama3` model for you, so it's ready to use.
    

## Accessing the Services

-   **n8n:** You can access the user interface at `http://localhost:5678`.
    
-   **Ollama:** The API is available at `http://localhost:11434`.
    
-   **Qdrant:** The API is available at `http://localhost:6333`.
