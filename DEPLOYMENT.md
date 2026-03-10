# 🚀 Deployment Guide - Online Quiz Portal

This document details the complete deployment process for the Online Quiz Portal, covering database hosting, backend API deployment, and frontend static site deployment.

---

## 📋 Deployment Architecture

```
┌─────────────────┐     API Calls      ┌─────────────────┐     SQL Queries     ┌─────────────────┐
│                 │ ──────────────────► │                 │ ──────────────────► │                 │
│   Frontend      │                    │   Backend       │                    │   Database      │
│   (Render)      │ ◄────────────────  │   (Render)      │ ◄────────────────  │   (Aiven)       │
│                 │     JSON Response  │                 │     Results        │                 │
│  Static Site    │                    │  Web Service    │                    │  MySQL 8.0      │
│  React + Vite   │                    │  Node + Express │                    │  1GB Storage    │
└─────────────────┘                    └─────────────────┘                    └─────────────────┘
```

| Component | Platform | Plan | URL |
|-----------|----------|------|-----|
| **Frontend** | [Render](https://render.com) - Static Site | Free | https://quiz-portal-ufnk.onrender.com |
| **Backend** | [Render](https://render.com) - Web Service | Free | https://quiz-portal-api-cltf.onrender.com |
| **Database** | [Aiven](https://aiven.io) - MySQL | Free (1GB) | mysql-3de7099-varshanaraju-b497.c.aivencloud.com |
| **Source Code** | [GitHub](https://github.com) | Free | https://github.com/Niranjan070/QUIZ_PORTAL |

---

## Step 1: Push Code to GitHub

### 1.1 Create a new GitHub repository
- Go to [github.com/new](https://github.com/new)
- Create a repo named `QUIZ_PORTAL`
- **Do not** initialize with README, .gitignore, or license

### 1.2 Push existing code
```bash
cd /path/to/online_quiz_portal

# Update remote to new repo
git remote set-url origin https://github.com/Niranjan070/QUIZ_PORTAL.git

# Stage, commit, and push
git add .
git commit -m "first commit"
git branch -M main
git push -u origin main
```

---

## Step 2: Database Deployment (Aiven MySQL)

### 2.1 Create Aiven Account
- Go to [aiven.io](https://aiven.io) and sign up (GitHub login works)
- Free plan provides **1 MySQL service** with **1GB storage**

### 2.2 Create MySQL Service
- Click **"Create service"** → Select **MySQL**
- Choose **Free plan**
- Pick a cloud region (we used **UpCloud: Singapore**)
- Name: `mysql-3de7099` (auto-generated)
- Click **Create** and wait for status to show **"Running"**

### 2.3 Get Connection Credentials
From the Aiven service **Overview** tab:

| Field | Example Value |
|-------|---------------|
| Host | `mysql-3de7099-varshanaraju-b497.c.aivencloud.com` |
| Port | `14907` |
| User | `avnadmin` |
| Password | `AVNS_xxxxxxxxxxxxx` |
| Database | `defaultdb` |
| SSL Mode | `REQUIRED` |

### 2.4 Update Backend Code for SSL Support
Modified `server/config/database.js` to support SSL connections:

```javascript
// Build pool config
const poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'online_quiz_portal',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
};

// Enable SSL for cloud databases (Aiven, etc.)
if (process.env.DB_SSL === 'true') {
    poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = mysql.createPool(poolConfig);
```

### 2.5 Create Deployment Schema
Created `database/deploy_schema.sql` — a combined version of the schema that:
- Removes `CREATE DATABASE` and `USE` statements (Aiven assigns a pre-named database `defaultdb`)
- Includes all migration columns (`funding_type`, `level`, `department`, `year`, `stream`, `designation`, `department_name`, `min_percentage_required`, `max_percentage_required`)
- Drops existing tables before creating new ones

### 2.6 Import Schema into Aiven
Since `mysql` CLI was not installed and the Aiven port was blocked on the local network (college Wi-Fi), we:

1. **Switched to mobile hotspot** to bypass port blocking
2. Used a **Node.js script** to import the schema via `mysql2`:

```bash
cd server
node -e "
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function run() {
    const conn = await mysql.createConnection({
        host: '<AIVEN_HOST>',
        port: <AIVEN_PORT>,
        user: '<AIVEN_USER>',
        password: '<AIVEN_PASSWORD>',
        database: 'defaultdb',
        ssl: { rejectUnauthorized: false },
        multipleStatements: true
    });
    
    const schema = fs.readFileSync(
        path.join(__dirname, '..', 'database', 'deploy_schema.sql'), 'utf8'
    );
    await conn.query(schema);
    
    const [tables] = await conn.query('SHOW TABLES');
    console.log('Tables:', tables.length);
    
    await conn.end();
}
run();
"
```

**Result:** 13 tables created, 7 sample users inserted.

---

## Step 3: Backend Deployment (Render Web Service)

### 3.1 Create Web Service on Render
- Go to [render.com](https://render.com) and sign up
- Click **"New +"** → **"Web Service"**
- Connect GitHub repo: `Niranjan070/QUIZ_PORTAL`

### 3.2 Configure Service

| Setting | Value |
|---------|-------|
| Name | `quiz-portal-api` |
| Region | Singapore (closest to Aiven DB) |
| Root Directory | `server` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `node index.js` |
| Instance Type | Free |

### 3.3 Set Environment Variables

| Key | Value |
|-----|-------|
| `DB_HOST` | `<Aiven MySQL Host>` |
| `DB_PORT` | `<Aiven MySQL Port>` |
| `DB_USER` | `<Aiven MySQL User>` |
| `DB_PASSWORD` | `<Aiven MySQL Password>` |
| `DB_NAME` | `defaultdb` |
| `DB_SSL` | `true` |
| `JWT_SECRET` | `<your-secret-key>` |
| `JWT_EXPIRE` | `7d` |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `CLIENT_URL` | `https://quiz-portal-ufnk.onrender.com` |

> **Tip:** Create a `.env` file with all variables and use Render's **"Add from .env"** button to import them all at once.

### 3.4 Deploy
Click **"Create Web Service"**. Render will:
1. Clone the repo
2. Run `npm install` in the `server/` directory
3. Start `node index.js`
4. Deploy at `https://quiz-portal-api-cltf.onrender.com`

### 3.5 Verify Backend
Check logs for:
```
✅ MySQL Database connected successfully!
🚀 Server running on port 5000
==> Your service is live 🎉
```

---

## Step 4: Frontend Deployment (Render Static Site)

### 4.1 Update API Base URL
Modified `client/src/services/api.js` to use environment variable:

```javascript
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: { 'Content-Type': 'application/json' }
});
```

### 4.2 Create Static Site on Render
- Click **"New +"** → **"Static Site"**
- Connect same GitHub repo: `Niranjan070/QUIZ_PORTAL`

### 4.3 Configure Static Site

| Setting | Value |
|---------|-------|
| Name | `quiz-portal` |
| Root Directory | `client` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |

### 4.4 Set Environment Variable

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://quiz-portal-api-cltf.onrender.com/api` |

### 4.5 Add Rewrite Rule (Critical for SPA)
After deployment, go to **Redirects/Rewrites** in the sidebar and add:

| Source | Destination | Action |
|--------|-------------|--------|
| `/*` | `/index.html` | Rewrite |

This ensures React Router works correctly — without it, refreshing any page other than `/` will return a 404.

### 4.6 Deploy
Click **"Deploy Static Site"**. Render will:
1. Clone the repo
2. Run `npm install && npm run build` in the `client/` directory
3. Serve the `dist/` folder as a static site
4. Deploy at `https://quiz-portal-ufnk.onrender.com`

---

## Step 5: Final Configuration

### 5.1 Update Backend CORS
Go to the **quiz-portal-api** service → **Environment** → add:

| Key | Value |
|-----|-------|
| `CLIENT_URL` | `https://quiz-portal-ufnk.onrender.com` |

This allows the frontend to make cross-origin API requests to the backend.

---

## ⚠️ Important Notes

### Free Tier Limitations

| Platform | Limitation |
|----------|-----------|
| **Render (Free)** | Services spin down after 15 min of inactivity. First request takes ~50s to wake up. |
| **Aiven (Free)** | 1GB storage, auto powers off after inactivity (must be manually re-powered). |

### Network Issues
- Some networks (college Wi-Fi, corporate firewalls) may **block non-standard ports** like Aiven's MySQL port (14907)
- **Solution:** Use mobile hotspot for database operations
- The deployed backend on Render connects to Aiven without port issues (server-to-server)

### Security Reminders
- Never commit `.env` files or credentials to GitHub
- GitHub has **Push Protection** that blocks pushes containing detected secrets
- Use Render's environment variable UI to manage secrets safely
- The `import_schema.js` file was removed from the repo after it was detected containing the Aiven password

---

## 🔄 Redeployment

### Auto-Deploy
Both Render services are set to **auto-deploy on commit**. Any push to `main` will trigger a new build.

### Manual Redeploy
1. Go to the service on Render dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

### Database Schema Changes
If you need to update the database schema:
1. Update `database/deploy_schema.sql`
2. Run the import script again (use mobile hotspot if needed)
3. Or connect via MySQL Workbench/DBeaver to execute SQL manually

---

## ✅ Deployment Checklist

- [x] Code pushed to GitHub (`Niranjan070/QUIZ_PORTAL`)
- [x] Aiven MySQL service created and running
- [x] Backend code updated for SSL support (`DB_SSL=true`)
- [x] Deployment schema created (`database/deploy_schema.sql`)
- [x] Schema imported into Aiven (13 tables, 7 users)
- [x] Backend deployed on Render (Web Service)
- [x] Backend environment variables configured (11 vars)
- [x] Frontend API URL made configurable (`VITE_API_URL`)
- [x] Frontend deployed on Render (Static Site)
- [x] Rewrite rule added for SPA routing
- [x] Backend CORS updated with frontend URL
