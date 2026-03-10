# 🛠️ ArtNode Backend - NestJS API

The engine behind ArtNode, handling experience management, authentication, 3D model processing, and custom QR generation.

## 🚀 Key Responsibilities

- **Authentication (JWT)**: Secure password-based auth for art administrators.
- **Image Logic (Sharp)**: Server-side generation of high-quality QR codes with custom logos, branding, and color masking.
- **ORM (Prisma)**: Efficient data handling with a Postgres layer.
- **Analytics Engine**: Tracks scans, session durations, and user ratings automatically.
- **Storage Integration**: Seamless file uploading to Supabase Buckets.

---

## 🏗️ Architecture Overview

The API follows a modular NestJS structure for high maintainability.

- **Experience Module**: Core logic for artifact creation, updates, and deletion.
- **User Module**: Handles profile settings, theme choices, and security.
- **QR Service**: Specialized service for generating branded QR codes using `Sharp` and `qrcode`.
- **Auth Module**: Token issuing and guard logic.

---

## 🛠️ Tech Stack & Dependencies

- **NestJS v10+** (Framework)
- **Prisma v6+** (ORM)
- **PostgreSQL** (Database)
- **Supabase Client** (Storage/Auth)
- **Sharp** (Image Processing)
- **Throttler** (Rate Limiting)
- **Swagger** (Interactive API Documentation at `/api`)

---

## ⚙️ Development Setup

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/) (Local or Supabase)

### 2. Quick Start

1.  Navigate here: `cd backend`
2.  Install: `npm install`
3.  Copy `.env.example` to `.env` and fill it with your Supabase keys.
4.  Generate Prisma Client: `npx prisma generate`
5.  Sync DB: `npx prisma db push`
6.  Start: `npm run start:dev`

### 🛡️ Core Environment Variables

```env
DATABASE_URL="postgresql://..." # From Supabase
SUPABASE_URL="https://..." # From Supabase Dashboard
SUPABASE_ANON_KEY="..." # From Supabase Dashboard
FRONTEND_URL="http://localhost:5173" # Used for constructing QR links
JWT_SECRET="..." # Your secret key
```

---

## 🚢 Production Deployment

### Building the Project

```bash
npm run build
```

### Running in Production (e.g. Render/Railway)

```bash
npm run start:prod
```

### Automatic Migration

Keep `DATABASE_URL` in your deployment settings so Prisma can connect to your host.

---

## 🔍 Health Checks

Verify the API is running by visiting:

- `GET http://localhost:3000/api` (Swagger Documentation)
- `GET http://localhost:3000/health` (Health Check Endpoint)
