# TransportPro API Documentation

A comprehensive API documentation for the TransportPro Inventory & Transport Management System backend. This document details all endpoints, request/response bodies, authentication, and requirements.

---

## Demo Credentials

- **Admin**
  - Email: `admin@transportpro.com` 
  - Password: `admin123`
- **Staff**
  - Email: `staff@transportpro.com`
  - Password: `staff123`

---

## Authentication

- All endpoints (except `/auth/login` and password reset) require a JWT Bearer token in the `Authorization` header.
- Example: `Authorization: Bearer <token>`

---

## Endpoints

### Auth

#### POST `/api/auth/login`

- **Description:** User login
- **Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

- **Response:** 200 OK, returns user object and JWT token

#### POST `/api/auth/forgot-password`

- **Description:** Request password reset
- **Request Body:**

```json
{
  "email": "string"
}
```

#### POST `/api/auth/reset-password/{token}`

- **Description:** Reset password
- **Request Body:**

```json
{
  "password": "string"
}
```

#### GET `/api/auth/profile`

- **Description:** Get user profile (requires auth)
- **Headers:** `Authorization: Bearer <token>`
- **Response:** User object

#### PUT `/api/auth/profile`

- **Description:** Update user profile (requires auth)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**

```json
{
  "fullName": "string",
  "phone": "string",
  "department": "string"
}
```

#### PUT `/api/auth/change-password`

- **Description:** Change password (requires auth)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**

```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

---

### Users (Admin Only)

#### GET `/api/users/`

- **Description:** List all users
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `page`, `limit`, `search`, `role`, `status`
- **Response:** Array of User objects

#### POST `/api/users/`

- **Description:** Create a new user
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**

```json
{
  "username": "string",
  "email": "string",
  "fullName": "string",
  "phone": "string",
  "department": "string",
  "password": "string",
  "role": "admin|staff",
  "status": "active|inactive",
  "permissions": { ... }
}
```

#### GET `/api/users/{id}`

- **Description:** Get user by ID
- **Headers:** `Authorization: Bearer <token>`
- **Response:** User object

#### PUT `/api/users/{id}`

- **Description:** Update user
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** (same as create)

#### DELETE `/api/users/{id}`

- **Description:** Delete user
- **Headers:** `Authorization: Bearer <token>`

#### PUT `/api/users/{id}/reset-password`

- **Description:** Reset user password
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**

```json
{
  "newPassword": "string"
}
```

#### PUT `/api/users/{id}/toggle-status`

- **Description:** Toggle user status
- **Headers:** `Authorization: Bearer <token>`

---

### Dashboard

#### GET `/api/dashboard/overview`

- **Description:** Get dashboard KPIs
- **Headers:** `Authorization: Bearer <token>`

#### GET `/api/dashboard/recent-trips`

- **Description:** Get recent trips
- **Headers:** `Authorization: Bearer <token>`

#### GET `/api/dashboard/fleet-status`

- **Description:** Get fleet status
- **Headers:** `Authorization: Bearer <token>`

#### GET `/api/dashboard/trips`

- **Description:** List trips
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `page`, `limit`, `status`, `vehicleId`

#### POST `/api/dashboard/trips`

- **Description:** Create trip
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** See Trip schema

#### GET `/api/dashboard/trucks`

- **Description:** List trucks
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `page`, `limit`, `status`, `model`

#### POST `/api/dashboard/trucks`

- **Description:** Create truck
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** See Truck schema

---

### Trips

#### GET `/api/trips/`

- **Description:** List all trips
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `page`, `limit`, `status`, `vehicleId`, `search`, `startDate`, `endDate`, `sortBy`, `sortOrder`

#### POST `/api/trips/`

- **Description:** Create a new trip
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**

```json
{
  "source": "string",
  "destination": "string",
  "goods": "string",
  "vehicleId": "string",
  "distance": 0,
  "startDate": "date-time",
  "returnDate": "date-time",
  "expenses": {
    "diesel": 0,
    "driver": 0,
    "tolls": 0,
    "tyre": 0,
    "misc": 0
  },
  "customerPayment": 0,
  "status": "completed|in-transit|pending|cancelled"
}
```

#### GET `/api/trips/{id}`

- **Description:** Get trip by ID
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Trip object

#### PUT `/api/trips/{id}`

- **Description:** Update trip
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** (same as create)

#### DELETE `/api/trips/{id}`

- **Description:** Delete trip
- **Headers:** `Authorization: Bearer <token>`

#### GET `/api/trips/stats`

- **Description:** Get trip statistics
- **Headers:** `Authorization: Bearer <token>`

#### GET `/api/trips/recent`

- **Description:** Get recent trips
- **Headers:** `Authorization: Bearer <token>`

#### POST `/api/trips/calculate-profit`

- **Description:** Calculate trip profit
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**

```json
{
  "expenses": 0,
  "customerPayment": 0
}
```

---

### Trucks

#### GET `/api/trucks/`

- **Description:** List all trucks
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `page`, `limit`, `status`, `model`, `search`, `startDate`, `endDate`, `sortBy`, `sortOrder`

#### POST `/api/trucks/`

- **Description:** Create a new truck
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**

```json
{
  "registrationNumber": "string",
  "model": "string",
  "modelYear": 0,
  "seller": {
    "name": "string",
    "contact": "string",
    "address": "string",
    "aadhaarNumber": "string",
    "email": "string"
  },
  "purchaseDate": "date-time",
  "purchasePrice": 0,
  "purchasePayments": [
    {
      "method": "cash|RTGS|cheque|UPI|other",
      "amount": 0,
      "date": "date-time"
    }
  ],
  "documents": {
    "NOC": true,
    "insurance": true,
    "fitness": true,
    "tax": true
  },
  "expenses": {
    "transportation": 0,
    "tollCharges": 0,
    "tyreCharges": 0,
    "fattaExpenses": 0,
    "driverCharges": 0,
    "bodyWork": 0,
    "paintExpenses": 0,
    "builtlyExpenses": 0,
    "diesel": 0,
    "kamaniWork": 0,
    "floorExpenses": 0,
    "insuranceExpenses": 0,
    "tyres": 0,
    "painting": 0,
    "misc": 0
  },
  "sale": {
    "buyer": {
      "name": "string",
      "contact": "string",
      "address": "string",
      "aadhaarNumber": "string",
      "email": "string"
    },
    "date": "date-time",
    "price": 0,
    "commission": 0,
    "commissionDealerName": "string",
    "payments": [
      {
        "method": "cash|RTGS|cheque|UPI|other",
        "amount": 0,
        "date": "date-time"
      }
    ]
  },
  "resaleProfit": 0,
  "status": "available|in-transit|maintenance|sold"
}
```

#### GET `/api/trucks/{id}`

- **Description:** Get truck by ID
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Truck object

#### PUT `/api/trucks/{id}`

- **Description:** Update truck
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** (same as create)

#### DELETE `/api/trucks/{id}`

- **Description:** Delete truck
- **Headers:** `Authorization: Bearer <token>`

#### GET `/api/trucks/stats`

- **Description:** Get truck statistics
- **Headers:** `Authorization: Bearer <token>`

#### GET `/api/trucks/fleet-status`

- **Description:** Get fleet status
- **Headers:** `Authorization: Bearer <token>`

#### GET `/api/trucks/available`

- **Description:** Get available trucks
- **Headers:** `Authorization: Bearer <token>`

#### PUT `/api/trucks/{id}/status`

- **Description:** Update truck status
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**

```json
{
  "status": "available|in-transit|maintenance|sold"
}
```

#### POST `/api/trucks/calculate-profit`

- **Description:** Calculate truck profit
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**

```json
{
  "purchasePrice": 0,
  "expenses": 0,
  "salePrice": 0,
  "commission": 0
}
```

---

### Reports

#### GET `/api/reports/overview`

- **Description:** Get KPIs for reports page
- **Headers:** `Authorization: Bearer <token>`

#### GET `/api/reports/transport`

- **Description:** Get transport analytics
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Array of Trip objects

#### GET `/api/reports/inventory`

- **Description:** Get inventory analytics
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Array of Truck objects

---

## Schemas

### User

```json
{
  "username": "string",
  "email": "string",
  "fullName": "string",
  "phone": "string",
  "department": "string",
  "password": "string",
  "role": "admin|staff",
  "status": "active|inactive",
  "permissions": {
    "transportation": {
      "viewTrips": true,
      "editTrips": true,
      "createTrips": true,
      "deleteTrips": true
    },
    "inventory": {
      "viewInventory": true,
      "editTrucks": true,
      "addTrucks": true,
      "deleteTrucks": true
    },
    "reports": {
      "viewReports": true,
      "exportReports": true
    },
    "userManagement": {
      "viewUsers": true,
      "editUsers": true,
      "createUsers": true,
      "deleteUsers": true
    }
  }
}
```

### Trip

```json
{
  "tripId": "string",
  "source": "string",
  "destination": "string",
  "goods": "string",
  "vehicleId": "string",
  "distance": 0,
  "startDate": "date-time",
  "returnDate": "date-time",
  "expenses": {
    "diesel": 0,
    "driver": 0,
    "tolls": 0,
    "tyre": 0,
    "misc": 0
  },
  "customerPayment": 0,
  "netProfit": 0,
  "status": "completed|in-transit|pending|cancelled"
}
```

### Truck

```json
{
  "truckId": "string",
  "registrationNumber": "string",
  "model": "string",
  "modelYear": 0,
  "seller": {
    "name": "string",
    "contact": "string",
    "address": "string",
    "aadhaarNumber": "string",
    "email": "string"
  },
  "purchaseDate": "date-time",
  "purchasePrice": 0,
  "purchasePayments": [
    {
      "method": "cash|RTGS|cheque|UPI|other",
      "amount": 0,
      "date": "date-time"
    }
  ],
  "documents": {
    "NOC": true,
    "insurance": true,
    "fitness": true,
    "tax": true
  },
  "expenses": {
    "transportation": 0,
    "tollCharges": 0,
    "tyreCharges": 0,
    "fattaExpenses": 0,
    "driverCharges": 0,
    "bodyWork": 0,
    "paintExpenses": 0,
    "builtlyExpenses": 0,
    "diesel": 0,
    "kamaniWork": 0,
    "floorExpenses": 0,
    "insuranceExpenses": 0,
    "tyres": 0,
    "painting": 0,
    "misc": 0
  },
  "sale": {
    "buyer": {
      "name": "string",
      "contact": "string",
      "address": "string",
      "aadhaarNumber": "string",
      "email": "string"
    },
    "date": "date-time",
    "price": 0,
    "commission": 0,
    "commissionDealerName": "string",
    "payments": [
      {
        "method": "cash|RTGS|cheque|UPI|other",
        "amount": 0,
        "date": "date-time"
      }
    ]
  },
  "resaleProfit": 0,
  "status": "available|in-transit|maintenance|sold"
}
```

---

## Error Codes

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 423: Locked
- 500: Internal Server Error

---

For more details, see the [Swagger UI](https://inventory-management-system-mzk7.onrender.com/api-docs) or the OpenAPI spec (`swagger-output.json`).
