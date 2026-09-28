# Vision Ledger

**Vision Ledger** is a full-stack personal finance management platform designed to help users track income, expenses, budgets, receipts, notifications, and financial reports in one place.

## Features

* 🔐 User registration and login
* 🔑 JWT-based authentication
* 🔒 Password hashing with bcrypt
* 💰 Income and expense tracking
* 🏷️ Transaction categories
* 📊 Dashboard and financial analytics
* 📈 Financial reports
* 💵 Budget management
* 🧾 Receipt scanning and OCR history
* 🔔 Persistent notification history
* 👤 User profile management
* ⚙️ Application settings
* 🌙 Theme support
* 🌐 Language support
* 📱 Responsive user interface

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* React Router
* Lucide React
* CSS

### Backend

* Node.js
* Express
* TypeScript
* JWT
* bcryptjs

### Database

* SQLite
* Prisma ORM
* Prisma Migrations

## Project Structure

```text
Vision Ledger/
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       └── server.ts
│
├── website/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── context/
│       ├── contexts/
│       ├── data/
│       ├── layouts/
│       ├── pages/
│       ├── App.tsx
│       ├── index.css
│       └── main.tsx
│
└── README.md
```

## Application Screens

The frontend currently includes:

* Login
* Register
* Dashboard
* Transactions
* Transaction Details
* Budgets
* Analytics
* Reports
* Notifications
* Receipt Scanning
* AI Insights
* Profile
* Settings
* Help
* 404 / Not Found

## Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/akirtha13062007-web/vision-ledger-finance.git
cd vision-ledger-finance
```

### 2. Install backend dependencies

Open PowerShell:

```powershell
cd backend
npm install
```

### 3. Start the backend

```powershell
npx tsx src/server.ts
```

The backend runs on:

```text
http://localhost:5000
```

### 4. Install frontend dependencies

Open a second PowerShell window:

```powershell
cd
```
5. Start the frontend
npm run dev

Vite will display the local frontend URL, typically:

http://local
host:5173

Open that address in your browser.

API

The backend provides REST API functionality for:

Authentication
Users
Transactions
Categories
Budgets
Category Budgets
Notifications
Receipt/OCR Scans
Financial Reports

The backend API runs on port 5000 by default.

Database

Vision Ledger uses SQLite with Prisma ORM.

Database migrations are stored in:

backend/prisma/migrations/

The local SQLite database is excluded from Git through .gitignore.

Security

The application uses:

JWT authentication
bcrypt password hashing
Protected API routes
Environment-based configuration for secrets
Git-ignored environment files
Git-ignored local database files
Important

Never commit the following to GitHub:

.env
.env.*
dev.db
*.sqlite
*.sqlite3

Never commit passwords, JWT secrets, API keys, or other sensitive credentials.

Development Status

Vision Ledger currently contains core modules for:

Authentication
Transactions
Categories
Budget management
Notifications
Receipt scanning
Analytics
Financial reports
User profiles
Application settings

The project can continue to be improved with additional testing, production configuration, deployment, accessibility improvements, and enhanced financial features.

Future Improvements

Possible future improvements include:

Automated frontend and backend testing
Improved authentication and session handling
Enhanced OCR accuracy
Advanced financial insights
More detailed budget alerts
Production database configuration
Cloud deployment
CI/CD pipeline
Improved accessibility
Additional report and export options
Git Workflow

After making changes to the project, save the latest version to GitHub with:

cd "D:\Projects\Vision Ledger"
git add -A
git commit -m "Update Vision Ledger"
git push

Check the repository status with:

git status

If you see:

nothing to commit, working tree clean
Everything up-to-date

your local project and GitHub repository are synchronized.

Repository

Vision Ledger — Full-Stack Personal Finance Management Platform

Built using React, TypeScript, Node.js, Express, Prisma, and SQLite.
