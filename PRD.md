# Product Requirements Document (PRD)

## Project Name: Inventory Management System

**Tech Stack:** MERN (MongoDB, Express.js, React.js, Node.js)

---

## Project Overview

The Inventory Management System (IMS) is a backend-driven logistics management tool tailored for transport companies. It offers streamlined management of truck journeys (trips), tracks expenses, computes profits, and maintains a second-hand truck inventory with purchase/sale details.

---

## Objectives

- Track and manage each truck journey (trip) with detailed expenses and profits.
- Record truck purchases and resales, including all associated financial data.
- Provide a central dashboard for admin to view analytics.
- Serve a clean, RESTful API for frontend integration.
- Keep the system extensible for future AI features.

---

## Modules & Features

### Trip Management Module

- **Create Trip**: Record source, destination, and goods.
- **Add Expenses**: Input diesel, driver, tolls, tyre, and miscellaneous costs.
- **Customer Payment**: Log how much the customer paid for the trip.
- **Net Profit Calculation**: Automatically calculate profit = payment - expenses.
- **Endpoints**:
  - `POST /trips`
  - `GET /trips`
  - `GET /trips/:id`
  - `PUT /trips/:id`
  - `DELETE /trips/:id`

### Truck Inventory Module

- **Add Purchase Details**: Register truck model, seller info, date, price.
- **Document Tracking**: NOC, fitness, insurance, tax.
- **Record Payments**: Payment methods (cash, RTGS, UPI, etc.) with timestamps.
- **Add Expenses**: Diesel, tyres, body work, painting, etc.
- **Sale Info**: Add buyer info, commission, payments, and date.
- **Resale Profit Calculation**: profit = sale price - (purchase + expenses + commission)
- **Endpoints**:
  - `POST /trucks`
  - `GET /trucks`
  - `GET /trucks/:id`
  - `PUT /trucks/:id`
  - `DELETE /trucks/:id`

### Authentication Module

- **Signup & Email Verification**
- **Signin with JWT**
- **Forgot/Reset Password with Email Support**
- **Admin account created on server boot**
- **Endpoints**:
  - `POST /auth/signup`
  - `GET /auth/verify/:token`
  - `POST /auth/signin`
  - `POST /auth/forgot`
  - `POST /auth/reset/:token`

### Admin Dashboard

- **Overview API**:
  - Total trips, trucks, purchases, sales, and overall profit.
- **Endpoint**:
  - `GET /admin/dashboard/overview`

---

## Sample Admin Overview Response

```json
{
  "trips": {
    "total": 10,
    "totalProfit": 25000
  },
  "trucks": {
    "total": 5,
    "totalPurchased": 5,
    "totalSold": 3,
    "totalResaleProfit": 180000,
    "averageResaleProfit": 60000,
    "totalPurchaseCost": 2300000,
    "totalSaleRevenue": 2600000
  }
}
```

---

## Future Scope (Low Priority for Now)

- AI-based Trip Profit Prediction using past trip data.
- OCR-based receipt tracking and fraud detection.
- Role-based access control (RBAC) for team-based companies.
- Interactive frontend dashboards.

---
