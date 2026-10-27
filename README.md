# TransportPro

Operations dashboard for a transport business: trip profitability, and the
buying and reselling of second-hand trucks.

**Live:** https://transportpro.vercel.app

## What it does

**Trips**
- Record a trip's source, destination and goods.
- Log every expense line (diesel, tolls, driver and others) and the customer payment.
- Net profit is calculated per trip.

**Truck inventory**
- Record purchases with price, seller and documents.
- Track refurbishment expenses such as tyres and painting.
- Record resale with buyer, price and commission; resale profit is calculated.

**Dashboard**
- Totals for trips, trucks, profit, sales and purchases.

**Accounts**
- Sign-up with email verification, JWT sessions, and forgot/reset password.

## Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18, TypeScript, Vite, React Router, Tailwind CSS |
| Backend  | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth     | JWT, bcrypt, email verification via Nodemailer |
| API docs | Swagger UI at `/api-docs` |

## Repository layout

```
backend/    Express API: routes, controllers, models, auth middleware
frontend/   React + Vite client
PRD.md      Product requirements
```

## Running locally

**Backend**

```bash
cd backend
npm install
npm run dev        # starts on PORT (default 5000)
```

Environment variables:

| Variable | Purpose |
|----------|---------|
| `MONGODB_USERNAME`, `MONGODB_PASSWORD` | MongoDB credentials |
| `JWT_SECRET` | Signing key for session tokens |
| `EMAIL_USER`, `EMAIL_PASS` | SMTP account for verification and reset emails |
| `FRONTEND_URL` | Used in email links and CORS |
| `PORT` | API port (optional) |

**Frontend**

```bash
cd frontend
npm install
npm run dev
```
