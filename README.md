# Production Email Queue with Nodemailer

A production-style **Node.js authentication API** that uses:
- **PostgreSQL** for users
- **Redis + BullMQ** for async email jobs
- **Nodemailer (Gmail SMTP)** for OTP and welcome emails
- **JWT + HTTP-only cookies** for authenticated sessions
- A simple static **frontend client** for signup/login/OTP verification

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Repository Structure](#repository-structure)
- [Tech Stack](#tech-stack)
- [How the Flow Works](#how-the-flow-works)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [How to Find Environment Variables in Code](#how-to-find-environment-variables-in-code)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Run the Project](#run-the-project)
- [Client Usage](#client-usage)
- [Database Migration](#database-migration)
- [Redis via Docker](#redis-via-docker)
- [Troubleshooting](#troubleshooting)
- [Security Notes](#security-notes)

---

## Overview

This project implements an OTP-based authentication flow where email sending is offloaded to a queue worker:

1. User signs up or logs in.
2. API generates and stores OTP in Redis (5-minute TTL).
3. API enqueues an email job in BullMQ.
4. Worker consumes the job and sends email via Nodemailer.
5. User submits OTP.
6. API verifies OTP and issues JWT token in an HTTP-only cookie.

---

## Architecture

- **API process** (`server.js`)
  - Exposes auth endpoints under `/api/auth`
  - Writes OTPs to Redis
  - Pushes email jobs into BullMQ queue
  - Reads/writes users in PostgreSQL

- **Worker process** (`worker.js` -> `workers/emailWorker.js`)
  - Subscribes to queue `email-queue`
  - Handles jobs:
    - `send-otp`
    - `send-welcome`
  - Sends actual emails through Nodemailer

- **Redis**
  - Stores OTP keys (`otp:<email>`) with 300s expiry
  - Backs BullMQ queue connection

- **PostgreSQL**
  - Stores users in `users` table

---

## Repository Structure

```text
.
├── server.js                          # API entrypoint
├── worker.js                          # Worker entrypoint
├── docker-compose.yaml                # Redis service
├── package.json
├── routes/
│   └── authRoutes.js                  # /signup, /login, /verify-otp
├── controllers/
│   └── authController.js
├── services/
│   ├── authService.js
│   ├── authVerificationService.js
│   ├── emailJobService.js
│   ├── otpService.js
│   ├── jwtService.js
│   └── tokenService.js
├── repository/
│   └── userRepository.js
├── infrastructure/
│   ├── db/
│   │   ├── client.js
│   │   ├── configs.js
│   │   ├── index.js
│   │   └── migrations/
│   │       └── 20260522123915_create_users_table.sql
│   ├── redis/
│   │   └── client.js
│   ├── queue/
│   │   ├── connection.js
│   │   └── emailQueue.js
│   └── email/
│       └── emailService.js
├── middleware/
│   ├── authmiddleware.js
│   └── errormiddleware.js
├── utils/
│   ├── logger.js
│   ├── errorHandler.js
│   ├── asyncHandler.js
│   └── appError.js
└── client/
    ├── index.html
    ├── signup.html
    ├── login.html
    ├── verify-otp.html
    ├── home.html
    ├── css/styles.css
    └── js/*.js
```

---

## Tech Stack

- Node.js + Express
- PostgreSQL (`pg`)
- Redis (`ioredis`)
- BullMQ
- Nodemailer
- JWT (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- Logging (`pino`, `pino-pretty`)
- DB migration tool (`dbmate`)

---

## How the Flow Works

### Signup
`POST /api/auth/signup`
- Validates duplicate email
- Hashes password
- Stores user in PostgreSQL
- Generates OTP and stores in Redis (`otp:<email>`, 300 sec)
- Enqueues `send-otp` job

### Login
`POST /api/auth/login`
- Verifies email/password
- Generates OTP
- Stores OTP in Redis
- Returns success message (OTP sent)

### Verify OTP
`POST /api/auth/verify-otp`
- Verifies OTP from Redis
- Deletes OTP after successful verification (single use)
- Generates JWT token
- Sets `token` cookie (`httpOnly`, `sameSite=strict`)
- Enqueues welcome email job

---

## API Endpoints

Base URL: `http://localhost:5000`

### 1) Signup
`POST /api/auth/signup`

Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "your-password"
}
```

### 2) Login
`POST /api/auth/login`

Body:
```json
{
  "email": "john@example.com",
  "password": "your-password"
}
```

### 3) Verify OTP
`POST /api/auth/verify-otp`

Body:
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Server
PORT=5000
NODE_ENV=development

# Auth
JWT_SECRET=replace_with_strong_secret

# PostgreSQL
DATABASE_URL=postgres://postgres:postgres@localhost:5432/emailqueue

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6382

# Gmail SMTP (Nodemailer)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_google_app_password
```

### Variable Details + Where Used

| Variable | Required | Purpose | Used In |
|---|---|---|---|
| `PORT` | No (defaults `5000`) | API listen port | `server.js` |
| `NODE_ENV` | Yes | Production cookie flag + logger transport | `controllers/authController.js`, `utils/logger.js` |
| `JWT_SECRET` | Yes | JWT sign/verify secret | `services/jwtService.js`, `services/tokenService.js`, `middleware/authmiddleware.js` |
| `DATABASE_URL` | Yes | PostgreSQL connection string | `infrastructure/db/configs.js` |
| `REDIS_HOST` | Yes | Redis host for queue + OTP store | `infrastructure/redis/client.js` |
| `REDIS_PORT` | Yes | Redis port for queue + OTP store | `infrastructure/redis/client.js` |
| `EMAIL_USER` | Yes | SMTP username and sender email | `infrastructure/email/emailService.js` |
| `EMAIL_PASS` | Yes | SMTP password/app password | `infrastructure/email/emailService.js` |

> For Gmail, use a **Google App Password** (not your normal account password) when 2FA is enabled.

---

## How to Find Environment Variables in Code

Use ripgrep from repository root:

```bash
rg "process\.env\.[A-Z0-9_]+" -n
```

You can inspect a specific variable, for example:

```bash
rg "process\.env\.JWT_SECRET" -n
rg "process\.env\.DATABASE_URL" -n
```

---

## Prerequisites

- Node.js 18+ (recommended)
- npm
- PostgreSQL
- Redis (or Docker)
- Gmail account with App Password for SMTP

---

## Local Setup

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create `.env` in project root (see [Environment Variables](#environment-variables)).

### 3) Start Redis (Docker option)

```bash
docker compose up -d redis
```

This maps local port `6382` -> container `6379`.

### 4) Create database

Create your PostgreSQL DB referenced in `DATABASE_URL`.

Example URL format:

```text
postgres://<user>:<password>@<host>:<port>/<database>
```

### 5) Run DB migration

```bash
npx dbmate up
```

---

## Run the Project

Open two terminals from project root.

### Terminal A: API server

```bash
node server.js
```

### Terminal B: email worker

```bash
node worker.js
```

If both are healthy:
- API should listen on `PORT` (default `5000`)
- Worker should log readiness and process queue jobs

---

## Client Usage

The client is static HTML in `/client` and calls API at `http://localhost:5000`.

To run quickly with VS Code Live Server:
- Open `client/index.html`
- Start Live Server (usually serves `http://127.0.0.1:5500`)

Then test flows:
1. Create account (`signup.html`)
2. Enter OTP (`verify-otp.html`)
3. Login with existing account (`login.html`)

---

## Database Migration

Migration file:
- `infrastructure/db/migrations/20260522123915_create_users_table.sql`

It creates `users` table with:
- `id` (UUID)
- `name`
- `email` (unique)
- `hashed_password`
- `is_verified`
- timestamps

Rollback:

```bash
npx dbmate down
```

---

## Redis via Docker

`docker-compose.yaml` provides:
- `redis:7-alpine`
- persistent volume `redis-data`
- port mapping `6382:6379`

Useful commands:

```bash
docker compose up -d redis
docker compose logs -f redis
docker compose down
```

---

## Troubleshooting

- **No scripts for `npm run lint/build/test`**
  - This repo currently does not define those scripts in `package.json`.

- **Emails not sending**
  - Verify `EMAIL_USER` and `EMAIL_PASS`
  - Ensure Gmail App Password is used
  - Check worker terminal logs

- **OTP always invalid/expired**
  - Confirm API and worker point to same Redis (`REDIS_HOST`, `REDIS_PORT`)
  - Verify Redis container is running

- **DB connection issues**
  - Verify `DATABASE_URL`
  - Confirm PostgreSQL server/database exists and is reachable

---

## Security Notes

- Use strong values for `JWT_SECRET`
- Never commit `.env`
- Use App Passwords for SMTP credentials
- In production, set `NODE_ENV=production` for secure cookie behavior

---

## Quick Start (Minimal)

```bash
npm install
docker compose up -d redis
# create .env
# ensure PostgreSQL exists
npx dbmate up
node server.js
# in another terminal
node worker.js
```
