# 📅 Room Reservation System (Google Apps Script)

A full-stack web application for managing meeting room bookings, built directly within the Google Workspace ecosystem. It features a responsive Gantt-chart timeline, conflict detection, and seamless integration with Google Sheets, Gmail, and Google Contacts.

![Status](https://img.shields.io/badge/Status-Active-success)
![Platform](https://img.shields.io/badge/Platform-Google%20Apps%20Script-4285F4?logo=googleappsscript)
![Database](https://img.shields.io/badge/Database-Google%20Sheets-34A853?logo=google-sheets)

## ✨ Features

- **📊 Interactive Timeline:** Pixel-perfect Gantt chart visualization of room availability.
- **🛡️ Conflict Detection:** Robust server-side logic prevents double bookings (`Logic.gs`).
- **👥 People Picker:** Integrated with the organization's Global Address List (GAL) via **Google People API**.
- **📧 Smart Notifications:**
  - Automated HTML emails for Confirmation, Updates, and Cancellations.
  - "Diff" highlighting in update emails (visualizing changes).
  - Injects the user's real **Gmail Signature** via Advanced API.
- **📱 Responsive UI:** Mobile-friendly sidebar and modal interactions.
- **🏗️ MVC Architecture:** Clean separation of concerns (Frontend, Controller, Database Layer).

## 📂 Project Structure

The project follows a modular structure to ensure maintainability:

| File | Type | Description |
| :--- | :--- | :--- |
| **`Code.gs`** | 🎮 Controller | Main entry point (`doGet`), router, and API endpoints. |
| **`Database.gs`** | 🗄️ Model | Data Access Layer (DAL) for reading/writing to Google Sheets. |
| **`Logic.gs`** | 🧠 Logic | Business rules engine (e.g., time overlap calculations). |
| **`Notification.gs`** | 📧 Service | Handles email sending and HTML template generation. |
| **`Contacts.gs`** | 👥 Service | Wraps the Google People API for directory search. |
| **`OpenPlatform.gs`** | 🛠️ Helper | UI utilities to launch the Web App from the Spreadsheet menu. |
| **`index.html`** | 🖼️ View | Main HTML structure (Sidebar, Grid, Modals). |
| **`styles.html`** | 🎨 View | CSS styling, variables, and responsive layout. |
| **`javascript.html`**| ⚡ View | Frontend logic, DOM manipulation, and event handlers. |
| **`spreadsheet_template.xlsx`** | 📄 Data | Template file with the required column structure. |

## 🚀 Setup & Installation

### 1. Database Setup (Crucial)
The system relies on specific column indexing. To avoid errors:
1. Download the `spreadsheet_template.xlsx` file from this repository.
2. Upload it to your Google Drive.
3. Open it and go to **File > Save as Google Sheets**.
4. Copy the **Spreadsheet ID** from the URL (e.g., `.../d/YOUR_ID_HERE/edit...`).

### 2. Script Installation
1. Open the new Google Sheet.
2. Go to **Extensions > Apps Script**.
3. Copy the files from this repository into the script editor (maintain the filenames exactly).

### 3. Enable Advanced Services
For the People Picker and Signature features to work, enable these services in the Apps Script editor (Left Sidebar > "Services +"):
- **Google People API**
- **Gmail API**

### 4. Configuration
Update the constants in the code to match your environment:

**In `Database.gs`:**
```javascript
const SPREADSHEET_ID = "PASTE_YOUR_SPREADSHEET_ID_HERE";
```
In Notification.gs:
```JavaScriptconst
FIXED_COPY_EMAIL = "reception@yourcompany.com";
```

### 5. Deploy
1. **Click Deploy > New Deployment.**
2. Select **Web App**.
3. Execute as: `Me` (The owner of the script).
4. Who has access: `Anyone within [Your Organization]` (Recommended).

## ⚙️ Data Structure
If you need to recreate the spreadsheet manually, ensure the `Reservations` tab has the following columns in this **exact order**:
| Col | Header | Description | 
| :-- | :--- | :--- |
| A | Room | Room Name |
| B | Email | Booker's Email |
| C | Subject | Meeting Subject |
| D | Requester | Booker's Name |
| E | Start | Start Date/Time |
| F | End | End Date/Time |
| G | Nbr Participants | Number of Participants |
| H | Event Type | e.g., Meeting, Call |
| I | Details | Description |
| J | Participants Emails | Semicolon separated emails |
| K | Timestamp | Creation Time |

The `Rooms` tab should list available room names in Column A.

## 🤝 Contributing
1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📝 License

Distributed under the MIT License.
