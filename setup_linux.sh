#!/bin/bash

# This script is the main entry point for Linux/macOS.
# It sources the function file and calls the main setup function.

# Source the setup functions from the setup/linux directory
source ./setup/linux/setup_functions.sh

# Run the main setup process
setup_main

