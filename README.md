# Transformer Thermal Image Management System

## 📌 Overview
This project is a **web-based platform** for managing transformer records and their associated thermal images under different environmental conditions.  

**Phase 1** focuses on building the system foundation, including:  
- An **admin interface** for transformer management  
- **Thermal image uploading**  
- **Metadata tagging** for organization and retrieval

⚠️ **Important Note**:  
The backend uploads images to **Google Drive**, generates shareable links, and stores them in **PostgreSQL**. The frontend then retrieves and displays these links.  

- **Issue on localhost**: Google Drive does not allow embedding images when accessed from an **HTTP localhost** environment, causing broken image previews in the UI.  
- **Workaround**: This issue does not occur when the system is deployed in a secure environment (e.g., GitHub Codespaces with HTTPS) or when hosted on any HTTPS-enabled server. (The issue didnt arise when developing since the project was developed in GitHub Codespace environment)

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
1. Configure Google Drive API for image uploads (Only if the token file has expired):
* The backend uploads images to Google Drive, generates links, and saves them in PostgreSQL.
* Two files are required for authentication:
  * Credential file
  * Token file
   * These two files are included in the `resources` folder of the Spring Boot backend as a ZIP file, since GitHub does not allow adding credential files directly. You need to unzip this file within the `resources` folder.
2. If you are running your PostgreSQL server locally rather than running the given Docker container, change the application.properties configurations accordingly.
3. Run the backend server after the database and authentication setup.

NOTE: When running the UIs, there may be an issue when photo uploading tasks if the token file has expired(STORED_CREDENTIAL file in resources). This will be mentioned as an error in the backend terminal or appear in api response data when tryng to upload base images or maintenance images. If this happens,

  1. Create a new Google OAuth2 account(with `http://localhost:8888/Callback` as redirect URI) and generate a new credential file.
  2. Replace the existing file in `resources` folder named `cient-secret-...` with this new credential file and change    `CREDENTIAL_FILE_PATH` in the GoogleDriveConfig file in the config folder in the backend to your new credential file.
  3. Run the RunAuthManual script located in the service folder(change `in` variable to your credential file path). This will open a browser window and ask to authenticate your Google account. The token file is automatically saved in the resources folder.

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
* No automated anomaly detection yet (Phase 2 requirement).
* Limited test data included (5 transformers with baseline images).
* Some UI elements may need refinement for responsiveness on smaller screens.

### Test Data

* Minimum of 5 transformer records with baseline images are included for testing.

### Repository

* Source code is hosted on GitHub.
* Follow the setup instructions to run the system locally.
