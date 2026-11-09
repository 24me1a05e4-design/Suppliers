# SupplierPro Website

A browser-based Supplier & Product Management website converted from the uploaded Java Swing project's features.

## Run in VS Code + Chrome (recommended)
1. Extract `SupplierPro-Website.zip`.
2. Open the extracted `SupplierPro-Website` folder in Visual Studio Code.
3. Install the **Live Server** extension (by Ritwick Dey) if you do not already have it.
4. In VS Code, right-click `index.html` and choose **Open with Live Server**.
5. Your browser opens a local address, usually `http://127.0.0.1:5500` or `http://localhost:5500`.

No Java, Maven, Node.js or database installation is required for this prototype.

## Features
- Dashboard summary cards and recent suppliers
- Supplier create, edit, delete, search and Active/Inactive filter
- Product create, edit, delete and search
- Supplier-product assignments (active suppliers only; duplicate links blocked)
- Browser localStorage persistence
- Responsive desktop and mobile layout

## Data storage / limitations
This prototype saves data in the browser's localStorage on the computer/browser where it is used. Data is not synchronized between different computers or users. Clearing browser site data may erase the saved records. This is a front-end demonstration, not a secure multi-user production system.

## Project files
- `index.html` — website structure
- `style.css` — design and responsive layout
- `app.js` — application logic and browser storage

## Reset demo data
To clear the saved SupplierPro data, open Chrome Developer Tools (F12) → Console and run:
`localStorage.removeItem('supplierpro_v1'); location.reload();`
