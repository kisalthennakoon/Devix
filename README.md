# Transformer Thermal Image Management System

## 📌 Overview
This project is a **web-based platform** for managing transformer records and their associated thermal images under different environmental conditions.  

**Phase 1** focuses on building the system foundation, including:  
- An **admin interface** for transformer management  
- **Thermal image uploading**  
- **Metadata tagging** for organization and retrieval

## ⚙️ Setup Instructions

### 🗄️ Database
Set up the PostgreSQL database using Docker:  

   1. Stop and remove any existing containers and volumes (clean reset):  
   ```bash
   docker compose down -v
   ```
   2. Start the containerized PostgreSQL database:
   ```bash
   docker-compose up -d postgres
   ```
   3. Load the dummy dataset (five transformers with baseline images) into the database:
   ```bash
   docker exec -i dev-postgres psql -U postgres -d Test < dump.sql
   ``` 
   This initializes the PostgreSQL database inside a container. The project `docker-compose.yml` file is configured to include both the frontend and backend services.

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

1. If you are running your PostgreSQL server locally rather than running the given Docker container, change the application.properties configurations accordingly.
2. Currently, we save images locally. Threrefore, specifying the local path to image storage is needed. In application.properties file in Springboot, give your path for the variable "image.upload.dir".
3. Run the backend server after the database setup.

## Implemented Features (Phase 1)

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

## Known Limitations / Issues

* Manual Google Drive authentication may be required if token expires.
* No automated anomaly detection yet (Phase 2 requirement).
* Limited test data included (5 transformers with baseline images).
* Some UI elements may need refinement for responsiveness on smaller screens.

## Test Data

* Minimum of 5 transformer records with baseline images are included for testing.

## Repository

* Source code is hosted on GitHub.
* Follow the setup instructions to run the system locally.
