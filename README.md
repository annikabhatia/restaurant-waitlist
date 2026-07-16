# Restaurant Waitlist App

A full-stack digital waitlist system for restaurants. Customers join via a QR code and receive an SMS notification when their table is ready. Staff manage the live queue from a secure dashboard.

## Features

### Customer
- Scan a QR code to open the join page on their phone
- Enter name, phone number, and party size
- See their position in the queue instantly after joining
- Receive an SMS when their table is ready (AWS Phase)

### Staff
- Secure password-protected login
- View the live waitlist in real time (auto-refreshes every 10 seconds)
- Mark a party as seated — removes them from the queue
- Remove a party manually
- Send a table-ready notification to a customer
- Visual indicator for long waits (20+ minutes highlighted in amber)
- "Notified ✓" state on the button after notification is sent

## Tech Stack

| Layer | Technology |
|---|---|
| Customer frontend | React + Vite |
| Staff frontend | React + Vite |
| Backend API | Node.js + Express |
| Database | PostgreSQL |
| Local dev environment | Docker + Docker Compose |
| Cloud deployment (planned) | AWS |

## Project Structure
```
restaurant-waitlist/
├── customer-app/        # Customer-facing join page (React)
├── staff-app/           # Staff dashboard (React)
├── backend/             # Express REST API
│   └── src/
│       ├── routes/
│       │   └── waitlist.js
│       ├── db/
│       │   └── index.js
│       └── index.js
└── docker-compose.yml   # Runs all 4 services locally
```

## Getting Started

### Prerequisites
- Docker Desktop
- Node.js + npm
- AWS CLI (configured with dummy credentials for local dev)

### Run locally

Clone the repo and start everything with one command:

```bash
docker compose up --build
```

This starts all 4 services:
- PostgreSQL database on port 5432
- Express backend on port 3000
- Customer app on port 5173
- Staff dashboard on port 5174

Then open:
- Customer join page: http://localhost:5173
- Staff dashboard: http://localhost:5174

### Create the database table

The first time you run the app, create the waitlist table:

```bash
docker exec -it postgres-local psql -U admin -d waitlist
```

Then paste:

```sql
CREATE TABLE waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15) NOT NULL UNIQUE,
  party_size INTEGER NOT NULL CHECK (party_size BETWEEN 1 AND 8),
  status VARCHAR(20) NOT NULL DEFAULT 'waiting',
  joined_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Staff login

Password: `rosarios2024` (replaced with AWS Cognito in Phase 3)

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/waitlist/join` | Public | Add a new party to the waitlist |
| GET | `/waitlist/status/:phone` | Public | Get queue position by phone number |
| GET | `/waitlist` | Staff | Get all waiting parties |
| PATCH | `/waitlist/:id/seat` | Staff | Mark a party as seated |
| DELETE | `/waitlist/:id` | Staff | Remove a party from the queue |
| POST | `/waitlist/:id/notify` | Staff | Send a table-ready notification |

## Database Schema

```sql
waitlist_entries
├── id          UUID PRIMARY KEY (auto-generated)
├── name        VARCHAR(100) NOT NULL
├── phone       VARCHAR(15) NOT NULL UNIQUE
├── party_size  INTEGER (1-8)
├── status      VARCHAR(20) DEFAULT 'waiting'
└── joined_at   TIMESTAMP DEFAULT NOW()
```

## Development Notes

- SMS notifications are currently stubbed — the backend logs the message to the console instead of sending a real text. Real SMS via Amazon SNS is wired up in Phase 3.
- Staff auth is a hardcoded password for local dev. AWS Cognito replaces this in Phase 3.
- The customer confirmation screen shows position at time of joining — live position updates via WebSocket are a planned Phase 3 feature.

## Roadmap

### Phase 1: Local build ✅
- [x] Project structure and Git/GitHub setup
- [x] PostgreSQL database with waitlist schema
- [x] Express backend with all 5 API routes
- [x] Customer join page — name, phone, party size, confirmation screen
- [x] Staff dashboard — live queue, seat/remove/notify actions
- [x] Basic staff authentication (password gate)
- [x] Duplicate phone number error handling
- [x] Containerized with Docker — full stack runs with `docker compose up`
- [x] Notify button with "Notified ✓" state

### Phase 2: Polish ⬜
- [ ] Mobile responsiveness testing on real device
- [ ] Edge case testing (double-click, empty states, concurrency)
- [ ] Write backend tests for all routes
- [ ] Update README with screenshots and demo video
- [ ] Architecture diagram

### Phase 3: AWS Migration ⬜
- [ ] Create AWS account
- [ ] PostgreSQL → Amazon RDS
- [ ] Express routes → AWS Lambda handlers
- [ ] API Gateway to expose Lambda functions
- [ ] Customer app → S3 + CloudFront
- [ ] Staff app → S3 + CloudFront
- [ ] Password gate → Amazon Cognito
- [ ] Console.log stub → Amazon SNS (real SMS)
- [ ] Live queue position updates via WebSocket (API Gateway WebSocket)
- [ ] Set up AWS billing alerts

### Phase 4: Showcase ⬜
- [ ] End-to-end testing on real AWS infrastructure
- [ ] Final README with live demo link and architecture diagram
- [ ] Project write-up for resume and LinkedIn

## About

Built as a self-directed full-stack engineering project to gain hands-on experience with React, Node.js, PostgreSQL, Docker, and AWS. Designed to mirror the kind of work done in a software engineering internship — including git workflow, containerization, API design, and cloud deployment planning.