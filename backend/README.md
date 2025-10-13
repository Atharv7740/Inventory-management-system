# TransportPro API – Inventory & Transport Management System

A robust Node.js/Express backend for managing users, authentication, trips, trucks, and analytics for transport and inventory operations. Features secure authentication, role-based access control (RBAC), and comprehensive RESTful APIs.

## Features

- **JWT Authentication** with secure password hashing (bcrypt)
- **Role-Based Access Control (RBAC)**: Admin & Staff roles, granular permissions
- **User Management**: Admin-only user CRUD, status toggling, password reset
- **Trip & Truck Management**: Full CRUD, analytics, profit calculation
- **Dashboard & Reports**: Real-time KPIs, analytics endpoints
- **Email Integration**: Password reset via email (nodemailer)
- **Security**: Rate limiting, account locking, CORS, input validation
- **Auto-generated API Docs**: Swagger UI at `/api-docs`

## 🗂️ Project Structure

```
IMS_backend/
├── config/         # DB connection, admin bootstrap
├── controllers/    # Business logic for each resource
├── middleware/     # Auth, permissions, rate limiting
├── models/         # Mongoose schemas
├── routes/         # Express route definitions
├── utils/          # Email, helpers
├── server.js       # App entry point
├── swagger-autogen.js # Swagger doc generator
└── swagger-output.json # Generated Swagger spec
```

## ⚡ Quick Start

### 1. Install Dependencies

```bash
cd IMS_backend
npm install
```

### 2. Environment Setup

Copy and edit your environment file:

```bash
cp env.example .env
```

Edit `.env` with your MongoDB URI, JWT secret, and email credentials.

### 3. Generate Swagger Docs

```bash
node swagger-autogen.js
```

### 4. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

Server runs at: [http://localhost:5000](http://localhost:5000)  
Swagger UI: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)

## 👤 Demo Accounts

- **Admin**:  
  Email: `admin@transportpro.com`  
  Password: `admin123`

- **Staff**:  
  Email: `staff@transportpro.com`  
  Password: `staff123`

## 🔑 Authentication & Authorization

- JWT-based authentication (`Authorization: Bearer <token>`)
- Admin: Full access
- Staff: Limited by permissions

---

## 📚 API Overview

### Auth (`/api/auth`)

- `POST /login` – User login
- `POST /forgot-password` – Request password reset
- `POST /reset-password/:token` – Reset password

Notes:

- The password reset email will send a link to the frontend reset page when the env var `FRONTEND_URL` is set (for example `https://app.example.com`). If `FRONTEND_URL` is not set, the server will default to using its own host (which may cause links to point to the backend). To ensure users receive a link to the frontend, set `FRONTEND_URL` in your environment.
- `GET /profile` – Get profile (auth)
- `PUT /profile` – Update profile (auth)
- `PUT /change-password` – Change password (auth)

### Users (`/api/users`) – Admin only

- `GET /` – List users
- `POST /` – Create user
- `GET /:id` – Get user by ID
- `PUT /:id` – Update user
- `DELETE /:id` – Delete user
- `PUT /:id/reset-password` – Reset user password
- `PUT /:id/toggle-status` – Toggle user status

### Dashboard (`/api/dashboard`)

- `GET /overview` – KPIs
- `GET /recent-trips` – Recent trips
- `GET /fleet-status` – Fleet status
- `GET /trips` – List trips
- `POST /trips` – Create trip
- `GET /trucks` – List trucks
- `POST /trucks` – Create truck

### Trips (`/api/trips`)

- `GET /` – List trips
- `POST /` – Create trip
- `GET /stats` – Trip stats
- `GET /recent` – Recent trips
- `GET /:id` – Get trip by ID
- `PUT /:id` – Update trip
- `DELETE /:id` – Delete trip
- `POST /calculate-profit` – Calculate trip profit

### Trucks (`/api/trucks`)

- `GET /` – List trucks
- `POST /` – Create truck
- `GET /stats` – Truck stats
- `GET /fleet-status` – Fleet status
- `GET /available` – Available trucks
- `GET /:id` – Get truck by ID
- `PUT /:id` – Update truck
- `PUT /:id/status` – Update truck status
- `DELETE /:id` – Delete truck
- `POST /calculate-profit` – Calculate truck profit

### Reports (`/api/reports`)

- `GET /overview` – KPIs
- `GET /transport` – Transport analytics
- `GET /inventory` – Inventory analytics

## 🛡️ Security

- Passwords hashed with bcrypt
- JWT for stateless auth
- Rate limiting on login
- Account lockout on brute force
- Input validation & sanitization
- CORS enabled
