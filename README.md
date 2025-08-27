# Transformer Thermal Image Management System – Phase 1

## Overview

This project is a web-based system to manage transformer records and their associated thermal images under various environmental conditions. Phase 1 focuses on building the foundation of the system, including an admin interface for transformer management, image uploading, and metadata tagging.

## Setup Instructions

### Frontend
1. Navigate to the frontend project directory.
2. Install dependencies:
   ```bash
   npm i
   ```
3. Start the development server:
  ```bash
  npm run dev
  ```
4. Open the browser and visit the URL displayed in the terminal (usually http://localhost:5173).

### Backend
1. Set up the PostgreSQL database using Docker:
   ```bash
   docker-compose up -d postgres
   ```
   This starts the PostgreSQL database in a container. The Docker path includes both the frontend and backend projects.
2. Configure Google Drive API for image uploads:
* The backend uploads images to Google Drive, generates links, and saves them in PostgreSQL.
* Two files are required for authentication:
  * Credential file
  * Token file
* These files are located in the `resources` folder in the backend project.
* If the token file has expired:
  1. Create a new OAuth account and generate a new credential file.
  2. Replace the existing file in `resources` named `ABCD`.
  3. Run the manual authentication script located in the `service` folder to generate a new token.
3. Start the backend server after the database and authentication setup.

### Implemented Features (Phase 1)

* FR1.1 – Admin Interface for Transformer Management
  * Add new transformer records (ID, location, capacity)
  * View, edit, and delete existing transformer records
* FR1.2 – Thermal Image Upload and Tagging
  * Upload baseline and maintenance thermal images
  * Associate images with transformer records
  * Store metadata: upload date/time, image type, uploader
* FR1.3 – Categorization by Environmental Conditions
  * Tag baseline images by environmental condition: Sunny, Cloudy, Rainy
  * Dropdown selection during image upload
* Additional Technical Features
  * Images stored efficiently for retrieval and viewing
  * Transformer and image metadata stored in PostgreSQL
  * Modular architecture for easy extension in future phases
  * Web-based admin interface

### Known Limitations / Issues

* Manual Google Drive authentication may be required if token expires.
* Current system only supports the three environmental conditions provided.
* No automated anomaly detection yet (Phase 2 requirement).
* Limited test data included (5 transformers with baseline images).
* Some UI elements may need refinement for responsiveness on smaller screens.

### Test Data

* Minimum of 5 transformer records with baseline images are included for testing.

### Repository

* Source code is hosted on GitHub.
* Follow the setup instructions to run the system locally.
