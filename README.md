# THOURAM — Community Volunteer Event Platform

> Rooted in community collaboration and Manipuri heritage.  
> Faithful implementation of the **Stitch Design System** using **React, Vite, Tailwind CSS, Node.js, Express, and MongoDB/Mongoose**.

---

## 🌟 Executive Overview

**THOURAM** is an end-to-end community volunteer event coordination platform. Designed to solve common friction in grassroots organizing, THOURAM provides:
1. **Intelligent Match Recommendations**: Transparent, algorithmic match scoring (0–100%) based on verified skills (40%), location proximity (20%), cause interests (20%), and past reliability (20%).
2. **Automated 10% Reserve Backups**: Events automatically calculate and manage reserve waitlists ($10\%$ of required quota). If a confirmed volunteer withdraws, the top waitlisted backup is promoted automatically with acceptance timeouts.
3. **Encrypted QR Attendance Passes**: Instantaneous on-site check-in with dynamic QR passes and manual override capabilities.
4. **Dual-Score Closeout & Impact Verification**: Distinguishes between **Reliability & Completion** (punctuality, duty commitment) and **Work Quality & Impact** (competence, teamwork), preventing inflated ratings while accurately accumulating verified service hours.
5. **Scoped Role Delegation**: Community-level role hierarchy (Organizer, Sub-Manager, Team Lead, Volunteer) with full audit logging.

---

## 🏗️ Architecture & Technology Stack

- **Frontend (`/client`)**: React 19, Vite, Tailwind CSS v4, React Router v7, React Hot Toast, Axios.
- **Backend (`/server`)**: Node.js, Express, MongoDB, Mongoose, JWT authentication with secure HTTP-only cookies, Helmet, Rate Limiting, QR Code generation, Crypto-JS encryption.
- **Design System**: Exact Stitch Design tokens, typography (`Plus Jakarta Sans` & `Inter`), geometric emblem, and custom color variables (`#004653`, `#245e6b`, `#9ed5e4`, `#d0e8d7`, `#ffdcc2`).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB running locally (default: `mongodb://localhost:27017/thouram`)

### 1. Installation

From the repository root:
```bash
# Install root, server, and client dependencies
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Environment Configuration
The `.env.example` file provides the template:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/thouram
JWT_SECRET=dev-jwt-secret-thouram-2025
JWT_EXPIRES_IN=7d
COOKIE_SECRET=dev-cookie-secret-thouram-2025
CLIENT_URL=http://localhost:5173
```
Create a local `.env` inside `server/` or copy from `.env.example`:
```bash
cp .env.example server/.env
```

### 3. Database Seeding
Populate the database with demo users, communities, the flagship 50-volunteer + 5-backup event, and historical closeout records:
```bash
npm run seed
```

### 4. Running the Application
Run both backend and frontend concurrently from the root directory:
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

---

## 🔑 Demo Credentials & Fast Role Switcher

The application features a sticky **Demo Mode Switcher** at the top of every screen to instantly switch perspectives in 1 click:

| Role | Name | Email | Password | Primary Hub |
| :--- | :--- | :--- | :--- | :--- |
| **Organizer** | Sanatombi Devi | `organizer@thouram.org` | `Password123!` | Organizer Hub & Roster (`/organizer-hub`) |
| **Sub-Manager** | Tomba Singh | `submanager@thouram.org` | `Password123!` | Roster & QR Scanner Access (`/organizer-hub`) |
| **Volunteer** | Bembem Laishram | `volunteer@thouram.org` | `Password123!` | Volunteer Portal & Pass (`/volunteer-dashboard`) |

---

## 🎯 End-to-End Workflow Demonstration

1. **Explore Events (`/events`)**:
   - Filter by cause category (*Environment & Lakes*, *Cultural Heritage*), city, or required skills.
   - Inspect the **Loktak Phumdi Restoration & Keibul Lamjao Habitat Drive** flagship event requiring **50 volunteers**.

2. **Transparent Match Scoring (`/events/:id`)**:
   - View detailed compatibility breakdown:
     - Verified Skills Match ($40\%$)
     - Proximity & Travel Radius ($20\%$)
     - Cause Interest Alignment ($20\%$)
     - Historical Reliability Score ($20\%$)

3. **10% Standby Backup Waitlist**:
   - When 50 confirmed slots are full, additional volunteers join the standby backup waitlist (5 slots = $\lceil 50 \times 0.10 \rceil$).
   - If a confirmed volunteer clicks **Withdraw**, the top waitlisted backup is automatically promoted to confirmed with acceptance notifications!

4. **Volunteer Pass & QR Check-In (`/volunteer-dashboard`)**:
   - Click **Open Event Pass (QR)** to view the encrypted, dynamic pass.
   - Switch to **Organizer** mode at `/organizer-hub`, click **Scan QR Check-In**, and scan or confirm arrival.

5. **Event Closeout & Dual Feedback Scores**:
   - In the Organizer Hub, click **Closeout & Rate Volunteer**.
   - Record distinct ratings:
     - **Reliability & Completion (1–5 Stars)**: Punctuality, honoring shifts.
     - **Work Quality & Impact (1–5 Stars)**: Teamwork, diligence.
   - Automatically credits verified service hours to the volunteer's permanent profile.

---

## 🛡️ Security & Quality Standards
- No hardcoded secrets; fully driven by environment variables.
- Standardized API response format with correlation IDs: `{ code, message, fieldErrors?, correlationId }`.
- Audit logs generated for all role changes, overrides, cancellations, check-ins, and ratings.
- Rate limiting on authentication routes.
