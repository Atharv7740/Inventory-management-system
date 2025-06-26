
# Inventory Management System API Documentation

> This is the backend for a full-stack Inventory Management System built with **Node.js**, **Express**, and **MongoDB**.
> It supports user authentication (with email verification), truck inventory management, trip profit tracking, and an admin dashboard overview.

---

## Base URL

```
http://localhost:3000/api
```

---

## Authentication Endpoints

### Signup

- **POST** `/auth/signup`
```json
{
  "name": "user",
  "email": "user@example.com",
  "password": "securePassword123"
}
```
- Includes **email verification via token**
- **Response:**
```json
{
  "message": "Signup successful! Please check your email to verify your account."
}
```

### Email Verification

- **GET** `/auth/verify/:token`
-  Activates account for login

### Signin

- **POST** `/auth/signin`
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

- **Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "user",
    "email": "user@example.com"
  }
}
```

-  Token includes `userId` and `email`

### Forgot Password

- **POST** `/auth/forgot`
```json
{ "email": "user@example.com" }
```

### Reset Password

- **POST** `/auth/reset/:token`
```json
{ "password": "newSecurePassword456" }
```

---

##  Trip Management Endpoints ( JWT Required)

### Create Trip

- **POST** `/trips`
```json
{
  "source": "Mumbai",
  "destination": "Pune",
  "goods": "Cement",
  "expenses": {
    "diesel": 2000,
    "driver": 500,
    "tolls": 300,
    "tyre": 150,
    "misc": 50
  },
  "customerPayment": 5000
}
```

-  Automatically calculates and saves `netProfit` using model method + pre-save hook

###  Get All Trips

- **GET** `/trips`

### 🔍 Get Trip by ID

- **GET** `/trips/:id`

###  Update Trip

- **PUT** `/trips/:id`
```json
{
  "customerPayment": 6000,
  "expenses": {
    "diesel": 2500,
    "driver": 800
  }
}
```

-  Automatically recalculates `netProfit` after update

###  Delete Trip

- **DELETE** `/trips/:id`

---

## Truck Management Endpoints ( JWT Required)

### Create Truck

- **POST** `/trucks`
```json
{
  "model": "Tata 407",
  "registrationNumber": "MH12AB1234",
  "seller": {
    "name": "Ramesh Traders",
    "contact": "9876543210",
    "address": "Pune"
  },
  "purchaseDate": "2024-06-01",
  "purchasePrice": 500000,
  "purchasePayments": [
    { "method": "cash", "amount": 200000, "date": "2024-06-01" },
    { "method": "GPay", "amount": 300000, "date": "2024-06-02" }
  ],
  "documents": {
    "NOC": true,
    "insurance": true,
    "fitness": false,
    "tax": true
  },
  "expenses": {
    "diesel": 10000,
    "bodyWork": 3000,
    "tyres": 4000,
    "painting": 2000,
    "misc": 1000
  },
  "sale": {
    "buyer": {
      "name": "Buyer X",
      "contact": "1234567890",
      "address": "Nashik"
    },
    "date": "2024-06-20",
    "price": 600000,
    "commission": 10000,
    "payments": [
      { "method": "UPI", "amount": 600000, "date": "2024-06-20" }
    ]
  }
}
```

- `resaleProfit` is calculated using model method and saved automatically

### Get All Trucks

- **GET** `/trucks`

### Get Truck by ID

- **GET** `/trucks/:id`

### Update Truck

- **PUT** `/trucks/:id`

- Recalculates resale profit on update

### Delete Truck

- **DELETE** `/trucks/:id`

---

## Admin Dashboard Analytics (JWT Required)

### Get Overview

- **GET** `/admin/dashboard/overview`

- **Response:**
```json
{
  "trips": {
    "total": 2,
    "totalProfit": 7000
  },
  "trucks": {
    "total": 1,
    "totalPurchased": 1,
    "totalSold": 1,
    "totalResaleProfit": 90000,
    "averageResaleProfit": 90000,
    "totalPurchaseCost": 500000,
    "totalSaleRevenue": 600000
  }
}
```

- Fixed issue with malformed `totalPurchaseCost` by removing accidental string interpolation and nested object leakage

---

## Postman Setup Guide

1. Set environment variables:
   - `baseUrl = http://localhost:3000/api`
   - `token = <JWT from /signin>`

2. Add Authorization header:
   ```
   Key: Authorization
   Value: Bearer {token}
   ```

---

## Admin Access

Admin account is seeded automatically:
```json
{
  "email": "admin@ims.com",
  "password": "Admin@1234"
}
```

- Admin can access and manage:
  - All trip and truck endpoints
  - Dashboard overview
  - User management features (future-ready)

---


