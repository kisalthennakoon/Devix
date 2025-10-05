# Transformer Thermal Image Management System

## 📌 Overview
This project is a **web-based platform** for managing transformer records and their associated thermal images under different environmental conditions.  

**Phase 1** focuses on building the system foundation, including:  
- An **admin interface** for transformer management  
- **Thermal image uploading**  
- **Metadata tagging** for organization and retrieval

**Phase 2** focuses on automated detection & review, including:

- **AI-driven anomaly detection** on thermal images (model infers regions of interest)
- **Side-by-side comparison UI** (Baseline vs. Current) with upload metadata
- **Annotation tools**: Reset, Move/Pan, and Zoom for the current image
- **Bounding boxes & labels** drawn from backend `bbox` data (index + confidence %)
- **Error list** synced with boxes (severity & confidence; red=faulty, orange=potential)
- **Weather selection** (Sunny / Cloudy / Rainy) for contextual review
- **No-anomaly handling**: hides alert badge and shows “No anomalies detected”

## 🔍 Anomaly Detection Method (Thermal Fault Analysis)

The anomaly detection method in this system is designed for **thermal images** to automatically identify and classify **electrical faults**, specifically distinguishing between **wire overloads** and **loose joints**.

### **1. Preprocessing**
- **Color Masking:** Converts the image to HSV and applies masks for “hot” colors (red/yellow) to highlight potential anomalies.  
- **Noise Removal:** Uses morphological operations (open, close, dilate) to clean the mask.  
- **Right Bar Removal:** Optionally removes the temperature scale on the image’s right side.  

### **2. Blob Detection & Merging**
- **Contour Extraction:** Detects hot regions as contours.  
- **Filtering:** Removes small blobs below the `min_area` threshold.  
- **Merging:** Combines overlapping or nearby blobs based on IoU (intersection over union) and pixel gap thresholds.  

### **3. Feature Extraction**
For each merged region:
- **Shape Features:** Aspect ratio, extent, circularity, eccentricity (via PCA), estimated thickness, skeleton length, etc.  
- **Color Features:** Ratio of red pixels (indicating temperature severity).  
- **Severity Score:** Computed from brightness contrast and area.  

### **4. Classification (Voting System)**
Each detected region is classified using a **rule-based voting system**:
- **Wire Votes:** High aspect ratio, high eccentricity, thin or elongated shape.  
- **Joint Votes:** High extent, roundness, thickness, or compactness.  
- **Decision:** The majority vote determines whether it’s a **Wire Overload** or **Loose Joint** (with fallback heuristics if tied).  

#### **Subtype Classification**
- **Wire Overload:**  
  - *Full Wire Overload* or *Point Overload (Potential/Faulty)* depending on coverage and color ratio.  
- **Loose Joint:**  
  - *Faulty* or *Potential* based on red pixel ratio.  

### **5. Annotation & Output**
- **Annotated Image:** Displays labeled bounding boxes with detected region type and severity.  
- **Heatmap Overlay:** Highlights thermal intensity visually.  
- **Metadata Output:** Includes bounding box, centroid, area, severity score, type, and hotspot details.


## ⚙️ Setup Instructions

First, clone the main branch on your local machine.

### Database (Optional, if you have PostgreSQL installed on your local machine)
Set up the PostgreSQL database using Docker:  

   1. Stop and remove any existing containers and volumes (clean reset):  
   ```bash
   docker compose down -v
   ```
   2. Start the containerized PostgreSQL database:
   ```bash
   docker-compose up -d postgres
   ```
   3. For the database seeding at the start, check whether 21 images exist in the `backend/main/src/resources/seed_images` path after cloning the repository. If not, extract the photos from this link (https://dms.uom.lk/s/HbFnsk3oPsH9GjH) into the path mentioned.

### Anomaly Detection Server

1. Navigate to the AI Server Folder.
2. Create a Python environment using `python -m venv venv` and activate it using `venv\scripts\activate` from windows or `source venv\bin\activate` from Linux.
3. Install Python Dependencies using `pip install -r requirements.txt`.
4. Run the Anomaly Detection Server using `python test.py`

   The Anomaly Server will run at: http://localhost:5001

### Backend

1. Navigate to the backend project directory.
2. **Database Configuration**  
   If you are running your **PostgreSQL server locally** (instead of using the provided Docker container), update the database connection details in your `application.properties` file  in `backend/main/src/resources` accordingly.

3. **Image Storage Configuration**  
   The system currently saves uploaded thermal images **locally**.  
   - Specify the local directory(absolute path) for image storage in the `application.properties` file as follows:  
     ```properties
     image.upload.dir=<your absolute path to image_store/uploads> 
     ```
     (Ex: D:/Devix/image_store/uploads)
     
   - Specify the absolute path of your **backend project folder**:  
     ```properties
     backend.absolute.path=<your absolute path to backend>
     ```
     (Ex: D:/Devix/backend)
     
   ⚠️ **Note:** Use **forwardslashes (`/`)** in path definitions when configuring on Windows as above examples.  

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
 
## Implemented Features (Phase 2)

- **FR2.1 – AI-Driven Anomaly Detection & Overlay**
  - Consume backend AI results and render **bounding boxes** on the *Current* image
  - Parse `bbox: [x, y, w, h]` in original pixels and **scale to displayed size**
  - Show **index badge (1, 2, …)** and **confidence %** on each box
  - Box color reflects status: **red = Faulty**, **orange = Potential Faulty**

- **FR2.2 – Side-by-Side Review UI**
  - Baseline (left) vs Current (right) images with **upload metadata** (time, date, user)
  - **Weather selector** (Sunny / Cloudy / Rainy) for contextual review
  - Clean base64 handling for reliable image rendering

- **FR2.3 – Annotation Tools**
  - **Reset**: restore default zoom and position
  - **Move/Pan**: click-and-drag the current image when zoomed
  - **Zoom**: step zoom in; smooth transform with centered origin

- **FR2.4 – Error List Synchronization**
  - Mirror AI results beneath the images as an **Errors** panel
  - Each item shows **Error N**, **fault type**, **confidence %**, and **severity %**
  - Error chip color matches box color (red/orange); area values omitted per spec
  - When no anomalies: show a clear **“No anomalies detected”** message

- **FR2.5 – Notes & Actions**
  - **Notes** textarea for reviewer comments

- **Additional Technical Details**
  - Robust parsing for AI payload fields: `bbox`, `faultConfidence`, `faultSeverity`, `faultType`
  - Confidence/severity accepted as **0–1  and normalized to **percentages**
  - Responsive layout with image **letterboxing awareness** to keep boxes aligned
  - Accessibility: index badges include `aria-label` for screen readers
  - Clean separation of UI state (zoom, pan, notes, weather) from fetched data


## Known Limitations / Issues

* Manual Google Drive authentication may be required if token expires.
* No automated anomaly detection yet (Phase 2 requirement).
* Limited test data included (5 transformers with baseline images).
* Some UI elements may need refinement for responsiveness on smaller screens.
* Uploading very large images can fail or stall on slower networks/browsers.
* The model may detect an anomaly but assign the wrong fault category in some cases.
* Motion blur/out-of-focus frames (e.g., T1 faulty images in the dataset) reduce detection accuracy.


## Test Data

* Minimum of 5 transformer records with baseline images are included for testing.

## Repository

* Source code is hosted on GitHub.
* Follow the setup instructions to run the system locally.
