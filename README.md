# Finance Data Processing and Access Control Backend

A role-based finance dashboard backend built with **Node.js**, **Express**, and **MongoDB** (MERN stack — backend portion). Supports financial record management, multi-role access control, and aggregated dashboard analytics.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Setup & Running Locally](#setup--running-locally)
4. [Environment Variables](#environment-variables)
5. [Role & Permission Model](#role--permission-model)
6. [API Reference](#api-reference)
   - [Auth](#auth-endpoints)
   - [Transactions](#transaction-endpoints)
   - [Dashboard](#dashboard-endpoints)
   - [Users](#user-management-endpoints)
7. [Data Models](#data-models)
8. [Design Decisions & Assumptions](#design-decisions--assumptions)
9. [Error Handling](#error-handling)
10. [Optional Enhancements Implemented](#optional-enhancements-implemented)

---

## Tech Stack

| Layer        | Technology                    |
|--------------|-------------------------------|
| Runtime      | Node.js                       |
| Framework    | Express.js                    |
| Database     | MongoDB (via Mongoose ODM)    |
| Auth         | JWT (jsonwebtoken + bcryptjs) |
| Validation   | express-validator             |
| Dev tooling  | nodemon, morgan               |

---

## Project Structure

```
finance-backend/
├── src/
│   ├── app.js                  # Express setup, middleware, route wiring
│   ├── config/
│   │   └── db.js               # MongoDB connection
│   ├── models/
│   │   ├── User.js             # User schema + password hashing
│   │   └── Transaction.js      # Financial record schema (soft delete)
│   ├── middleware/
│   │   ├── authenticate.js     # JWT verification
│   │   ├── rbac.js             # Role-Based Access Control guards
│   │   └── errorHandler.js     # Centralized error handler + validator runner
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── transaction.validator.js
│   │   └── user.validator.js
│   ├── services/
│   │   ├── auth.service.js     # Register + login business logic
│   │   ├── user.service.js     # User CRUD business logic
│   │   ├── transaction.service.js
│   │   └── dashboard.service.js  # MongoDB aggregation pipelines
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── transaction.controller.js
│   │   └── dashboard.controller.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── transaction.routes.js
│   │   └── dashboard.routes.js
│   └── utils/
│       └── seed.js             # Demo data seeder
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Setup & Running Locally

### Prerequisites

- Node.js v18+
- MongoDB running locally (`mongodb://localhost:27017`) **or** a MongoDB Atlas URI

### Steps

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd finance-backend

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Edit .env with your MongoDB URI and a strong JWT secret

# 4. (Optional) Seed demo data
npm run seed

# 5. Start the server
npm run dev        # development (auto-reload via nodemon)
npm start          # production
```

Server starts on `http://localhost:5000` by default.

---

## Environment Variables

| Variable        | Description                              | Default                                      |
|-----------------|------------------------------------------|----------------------------------------------|
| `PORT`          | Port the server listens on               | `5000`                                       |
| `MONGO_URI`     | MongoDB connection string                | `mongodb://localhost:27017/finance_dashboard` |
| `JWT_SECRET`    | Secret key used to sign JWTs             | *(required — set a strong random string)*    |
| `JWT_EXPIRES_IN`| JWT expiry duration                      | `7d`                                         |
| `NODE_ENV`      | `development` or `production`            | `development`                                |

---

## Role & Permission Model

Three roles are supported, ordered by access level:

| Role       | Level | Capabilities                                              |
|------------|-------|-----------------------------------------------------------|
| `viewer`   | 1     | Read transactions and own profile                         |
| `analyst`  | 2     | Everything viewer can do + all dashboard summary endpoints|
| `admin`    | 3     | Full access: create/update/delete records, manage users   |

Access is enforced by the `authorize(...roles)` middleware in `src/middleware/rbac.js`. The hierarchy is additive — an analyst can do everything a viewer can, and an admin can do everything an analyst can.

**Key rules:**
- Only admins can create records, update records, and delete records
- Only admins can manage (view/update/delete) other users
- Admins cannot deactivate or delete their own account
- Inactive users are rejected at the authentication layer regardless of token validity
- Creating an admin account via the public register endpoint is blocked — you must be an authenticated admin

---

## API Reference

All protected routes require the header:
```
Authorization: Bearer <token>
```

### Auth Endpoints

#### `POST /api/auth/register`
Register a new user. Public endpoint.

**Body:**
```json
{
  "name": "Aarav Mehta",
  "email": "aarav@example.com",
  "password": "Secret@123",
  "role": "viewer"
}
```
> `role` defaults to `viewer`. Only an authenticated admin can register `admin` role accounts.

**Response `201`:**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": { "_id": "...", "name": "Aarav Mehta", "email": "...", "role": "viewer" },
    "token": "<jwt>"
  }
}
```

---

#### `POST /api/auth/login`
Authenticate and receive a JWT.

**Body:**
```json
{ "email": "aarav@example.com", "password": "Secret@123" }
```

**Response `200`:**
```json
{
  "success": true,
  "data": { "user": { ... }, "token": "<jwt>" }
}
```

---

#### `GET /api/auth/me`
Returns the currently authenticated user's profile. **Requires auth.**

---

### Transaction Endpoints

| Method | Route                    | Min Role | Description                         |
|--------|--------------------------|----------|-------------------------------------|
| GET    | `/api/transactions`      | viewer   | List transactions (filterable)      |
| GET    | `/api/transactions/:id`  | viewer   | Get single transaction              |
| POST   | `/api/transactions`      | admin    | Create a transaction                |
| PATCH  | `/api/transactions/:id`  | admin    | Update a transaction                |
| DELETE | `/api/transactions/:id`  | admin    | Soft-delete a transaction           |

#### `GET /api/transactions` — Query Parameters

| Param       | Type   | Description                             |
|-------------|--------|-----------------------------------------|
| `type`      | string | Filter by `income` or `expense`         |
| `category`  | string | Filter by category name (partial match) |
| `startDate` | string | ISO 8601 date lower bound               |
| `endDate`   | string | ISO 8601 date upper bound               |
| `search`    | string | Search in notes field                   |
| `page`      | number | Page number (default: 1)                |
| `limit`     | number | Results per page (default: 20, max: 100)|
| `sortBy`    | string | Field to sort by (default: `date`)      |
| `order`     | string | `asc` or `desc` (default: `desc`)       |

**Example:** `GET /api/transactions?type=expense&startDate=2024-01-01&page=1&limit=10`

#### `POST /api/transactions` Body:
```json
{
  "amount": 45000,
  "type": "income",
  "category": "Salary",
  "date": "2024-06-01",
  "notes": "Monthly salary - June 2024"
}
```

---

### Dashboard Endpoints

All require **analyst** role or above.

| Method | Route                        | Description                              |
|--------|------------------------------|------------------------------------------|
| GET    | `/api/dashboard/overview`    | Total income, expenses, net balance      |
| GET    | `/api/dashboard/categories`  | Totals grouped by category               |
| GET    | `/api/dashboard/monthly`     | Monthly trends for a given year          |
| GET    | `/api/dashboard/recent`      | Most recent N transactions               |
| GET    | `/api/dashboard/weekly`      | Weekly totals for past N weeks           |

#### `GET /api/dashboard/overview` Response:
```json
{
  "success": true,
  "data": {
    "totalIncome": 250000,
    "totalExpenses": 98500,
    "netBalance": 151500,
    "incomeCount": 12,
    "expenseCount": 34,
    "totalTransactions": 46
  }
}
```

#### `GET /api/dashboard/monthly?year=2024` Response:
```json
{
  "success": true,
  "data": {
    "year": 2024,
    "months": [
      { "month": 1, "monthName": "January", "income": 45000, "expense": 8200, "net": 36800 },
      ...
    ]
  }
}
```

#### `GET /api/dashboard/recent?limit=5`
Returns the 5 most recently created transactions.

#### `GET /api/dashboard/weekly?weeks=4`
Returns weekly income/expense breakdown for the past 4 weeks.

---

### User Management Endpoints

All require **admin** role.

| Method | Route            | Description                          |
|--------|------------------|--------------------------------------|
| GET    | `/api/users`     | List all users (paginated)           |
| GET    | `/api/users/:id` | Get a specific user                  |
| PATCH  | `/api/users/:id` | Update a user's name, role, or status|
| DELETE | `/api/users/:id` | Permanently delete a user            |

#### `PATCH /api/users/:id` Body (all fields optional):
```json
{
  "role": "analyst",
  "status": "inactive",
  "name": "Updated Name"
}
```

#### `GET /api/users` Query Params:
- `page` (default: 1)
- `limit` (default: 20)

---

## Data Models

### User
```
_id        ObjectId
name       String (required, max 80)
email      String (required, unique, lowercase)
password   String (hashed, never returned)
role       String  enum: viewer | analyst | admin (default: viewer)
status     String  enum: active | inactive (default: active)
createdAt  Date
updatedAt  Date
```

### Transaction
```
_id         ObjectId
amount      Number  (required, > 0)
type        String  enum: income | expense (required)
category    String  (required, max 60)
date        Date    (required, default: now)
notes       String  (optional, max 500)
createdBy   ObjectId → User (required)
isDeleted   Boolean (default: false — soft delete flag)
deletedAt   Date    (null unless deleted)
createdAt   Date
updatedAt   Date
```

---

## Design Decisions & Assumptions

### 1. Service Layer Separation
Business logic lives entirely in the `services/` layer. Controllers only parse HTTP input and format HTTP output. This keeps controllers thin and makes services independently testable.

### 2. Soft Delete for Transactions
Transactions are never hard-deleted. Setting `isDeleted: true` preserves the financial audit trail. A Mongoose `pre(/^find/)` hook automatically filters deleted records from all standard queries. Hard purge can be added as a separate admin-only endpoint if needed.

### 3. Role Hierarchy (Additive)
Rather than listing permissions per route individually, the RBAC middleware uses a numeric hierarchy (`viewer=1, analyst=2, admin=3`). Calling `authorize("analyst")` grants access to analysts **and** admins, avoiding redundant role checks.

### 4. Admin Self-Protection
Admins cannot deactivate or delete their own account. This prevents accidental lockout in single-admin setups.

### 5. Public Register with Escalation Guard
The `/register` endpoint is public so the system can be bootstrapped without a separate seeding command. Admin account creation is blocked at the controller layer unless the request comes from an authenticated admin.

### 6. Dashboard via MongoDB Aggregation
All dashboard computations use MongoDB's native aggregation pipeline (`$group`, `$match`, `$sort`) instead of post-processing in JavaScript. This keeps the computation server-side and scales better with large datasets.

### 7. Monthly Trends: Full 12-Month Grid
Even for months with zero transactions, the monthly trends endpoint returns all 12 months. This prevents frontend charting libraries from receiving sparse data and rendering gaps.

### 8. Password Never Returned
The User schema marks `password` with `select: false` and overrides `toJSON()` to strip it. The password is never exposed in any API response.

### 9. Pagination Defaults
Listing endpoints default to `page=1, limit=20` and cap at `limit=100` per request to prevent accidental full-table dumps.

---

## Error Handling

All errors flow to the centralized `errorHandler` middleware in `src/middleware/errorHandler.js`.

| Scenario                   | HTTP Status |
|----------------------------|-------------|
| Missing or invalid JWT     | 401         |
| Expired JWT                | 401         |
| Insufficient role          | 403         |
| Resource not found         | 404         |
| Duplicate email            | 409         |
| Validation failure         | 422         |
| Mongoose validation error  | 422         |
| Invalid MongoDB ObjectId   | 400         |
| Unexpected server error    | 500         |

Error responses always follow this shape:
```json
{
  "success": false,
  "message": "Human-readable error description.",
  "errors": [ { "field": "email", "message": "..." } ]  // only on validation failures
}
```

In `development` mode the response also includes a `stack` field for easier debugging.

---

## Optional Enhancements Implemented

| Enhancement           | Status | Details                                                         |
|-----------------------|--------|-----------------------------------------------------------------|
| JWT Authentication    | ✅     | Full token-based auth with expiry                               |
| Pagination            | ✅     | `page` + `limit` on all list endpoints                          |
| Search / Filtering    | ✅     | Filter transactions by type, category, date range, notes search |
| Soft Delete           | ✅     | `isDeleted` flag + `deletedAt` timestamp on transactions        |
| Seed Script           | ✅     | `npm run seed` creates 3 demo users + 60 randomised transactions|
| Structured Error Format| ✅    | Consistent JSON error shape with field-level validation details |
| Morgan HTTP Logging   | ✅     | Request logging in development mode                             |

---

## Demo Credentials (after `npm run seed`)

| Role    | Email                      | Password      |
|---------|----------------------------|---------------|
| Admin   | admin@financeapp.dev       | Admin@1234    |
| Analyst | analyst@financeapp.dev     | Analyst@1234  |
| Viewer  | viewer@financeapp.dev      | Viewer@1234   |