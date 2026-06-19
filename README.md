# Restaurant Waitlist App

A digital waitlist system for restaurants. Customers join via a QR code and get notified when their table is ready. Staff manage the live queue from a dashboard.

## Features

- **Customer join page** — scan a QR code, enter name/phone/party size, see live queue position
- **Staff dashboard** — view the live waitlist, seat or remove parties, send "table ready" notifications
- Real-time queue updates via polling
- Built with a production-style local development environment using Docker

## Tech stack

- **Frontend:** React + Vite (customer app and staff dashboard, two separate apps)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Local dev environment:** Docker + Docker Compose
- **Planned cloud deployment:** AWS (S3 + CloudFront, Lambda + API Gateway, RDS, Cognito, SNS)

## Project structure

```
restaurant-waitlist/
├── customer-app/      # Customer-facing join page (React)
├── staff-app/          # Staff dashboard (React)
├── backend/             # Express API
└── docker-compose.yml   # Runs PostgreSQL + backend locally
```
## Getting started

### Prerequisites
- Docker Desktop
- Node.js + npm
- AWS CLI (for future AWS migration)

### Run locally

1. Clone the repo
2. Start the database and backend:
```bash
   docker compose up --build
```
3. In a separate terminal, start the customer app:
```bash
   cd customer-app
   npm install
   npm run dev
```
4. In another terminal, start the staff dashboard:
```bash
   cd staff-app
   npm install
   npm run dev
```

## API routes

| Method | Route | Description |
|---|---|---|
| POST | `/waitlist/join` | Add a new party to the waitlist |
| GET | `/waitlist` | Get all waiting parties |
| PATCH | `/waitlist/:id/seat` | Mark a party as seated |
| DELETE | `/waitlist/:id` | Remove a party from the waitlist |
| POST | `/waitlist/:id/notify` | Send a table-ready notification |

## Roadmap

- [ ] Staff authentication
- [ ] Real SMS notifications (currently stubbed to console log)
- [ ] Containerize frontends with Docker
- [ ] Deploy to AWS (S3, Lambda, RDS, Cognito, SNS)

## Status

Actively in development — built as a self-directed summer project to gain hands-on full-stack and cloud engineering experience.