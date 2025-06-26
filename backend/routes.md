# API Documentation

## Base URL
`/api`

---

## Authentication (User Accounts)

### Signup (Register)
- **POST** `/api/auth/signup`
- **Body:**
```json
{
  "name": "Your Name",
  "email": "your@email.com",
  "password": "yourpassword"
}
```
- **Response:**
```json
{
  "message": "Signup successful! Please check your email to verify your account."
}
```

### Signin (Login)
- **POST** `/api/auth/signin`
- **Body:**
```json
{
  "email": "your@email.com",
  "password": "yourpassword"
}
```
- **Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "Your Name",
    "email": "your@email.com"
  }
}
```

### Verify Email
- **GET** `/api/auth/verify/:token`
- **Response:**
```json
{
  "message": "Email verified successfully! You can now sign in."
}
```

### Forgot Password
- **POST** `/api/auth/forgot`
- **Body:**
```json
{
  "email": "your@email.com"
}
```
- **Response:**
```json
{
  "message": "Password reset link sent to your email."
}
```

### Reset Password
- **POST** `/api/auth/reset/:token`
- **Body:**
```json
{
  "password": "yournewpassword"
}
```
- **Response:**
```json
{
  "message": "Password reset successful! You can now sign in with your new password."
}
```

---

## Trip Profit Module

### Create Trip
- **POST** `/api/trips`
- **Body:**
```json
{
  "source": "City A",
  "destination": "City B",
  "goods": "Cement",
  "expenses": {
    "diesel": 1000,
    "driver": 500,
    "tolls": 200,
    "tyre": 100,
    "misc": 50
  },
  "customerPayment": 3000
}
```
- **Response:** 201 Created, Trip object

### Get All Trips
- **GET** `/api/trips`
- **Response:** 200 OK, Array of Trip objects

### Get Trip by ID
- **GET** `/api/trips/:id`
- **Response:** 200 OK, Trip object

### Update Trip
- **PUT** `/api/trips/:id`
- **Body:** (same as create)
```json
{
  "source": "City A",
  "destination": "City B",
  "goods": "Cement",
  "expenses": {
    "diesel": 1000,
    "driver": 500,
    "tolls": 200,
    "tyre": 100,
    "misc": 50
  },
  "customerPayment": 3000
}
```
- **Response:** 200 OK, Updated Trip object

### Delete Trip
- **DELETE** `/api/trips/:id`
- **Response:**
```json
{ "message": "Trip deleted" }
```

---

## Truck Inventory Module

### Create Truck
- **POST** `/api/trucks`
- **Body:**
```json
{
  "model": "Tata 407",
  "seller": {
    "name": "Seller Name",
    "contact": "1234567890",
    "address": "Seller Address"
  },
  "purchaseDate": "2024-05-01",
  "purchasePrice": 500000,
  "purchasePayments": [
    { "method": "cash", "amount": 200000, "date": "2024-05-01" },
    { "method": "GPay", "amount": 300000, "date": "2024-05-02" }
  ],
  "documents": {
    "NOC": true,
    "insurance": true,
    "fitness": false,
    "tax": true
  },
  "expenses": {
    "diesel": 10000,
    "bodyWork": 5000,
    "tyres": 8000,
    "painting": 2000,
    "misc": 1000
  },
  "sale": {
    "buyer": {
      "name": "Buyer Name",
      "contact": "0987654321",
      "address": "Buyer Address"
    },
    "date": "2024-06-01",
    "price": 600000,
    "commission": 10000,
    "payments": [
      { "method": "RTGS", "amount": 600000, "date": "2024-06-01" }
    ]
  }
}
```
- **Response:** 201 Created, Truck object

### Get All Trucks
- **GET** `/api/trucks`
- **Response:** 200 OK, Array of Truck objects

### Get Truck by ID
- **GET** `/api/trucks/:id`
- **Response:** 200 OK, Truck object

### Update Truck
- **PUT** `/api/trucks/:id`
- **Body:** (same as create)
```json
{
  "model": "Tata 407",
  "seller": {
    "name": "Seller Name",
    "contact": "1234567890",
    "address": "Seller Address"
  },
  "purchaseDate": "2024-05-01",
  "purchasePrice": 500000,
  "purchasePayments": [
    { "method": "cash", "amount": 200000, "date": "2024-05-01" },
    { "method": "GPay", "amount": 300000, "date": "2024-05-02" }
  ],
  "documents": {
    "NOC": true,
    "insurance": true,
    "fitness": false,
    "tax": true
  },
  "expenses": {
    "diesel": 10000,
    "bodyWork": 5000,
    "tyres": 8000,
    "painting": 2000,
    "misc": 1000
  },
  "sale": {
    "buyer": {
      "name": "Buyer Name",
      "contact": "0987654321",
      "address": "Buyer Address"
    },
    "date": "2024-06-01",
    "price": 600000,
    "commission": 10000,
    "payments": [
      { "method": "RTGS", "amount": 600000, "date": "2024-06-01" }
    ]
  }
}
```
- **Response:** 200 OK, Updated Truck object

### Delete Truck
- **DELETE** `/api/trucks/:id`
- **Response:**
```json
{ "message": "Truck deleted" }
```

---

## Error Response
- All errors return:
```json
{ "error": "message" }
```
with appropriate HTTP status code. 