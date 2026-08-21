# FinTrack — Personal Finance & Expense Tracker

[![Backend](https://img.shields.io/badge/Backend-Spring%20Boot%203.4-6DB33F?logo=spring)](https://spring.io/projects/spring-boot)
[![Frontend](https://img.shields.io/badge/Frontend-Angular%2022-DD0031?logo=angular)](https://angular.dev)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%2017-4169E1?logo=postgresql)](https://www.postgresql.org)
[![Containerized](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://docs.docker.com/compose)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A production-grade personal finance tracking application built as a full-stack modular monolith — featuring per-user data isolation, JWT authentication, transaction management with dynamic filtering, monthly budget health tracking, and an interactive financial dashboard.

---

## ✨ Features

| Area | Capabilities |
|---|---|
| **Authentication** | Register, Login, JWT (HS256), stateless session |
| **Dashboard** | Monthly income/expense/balance summary, category spending breakdown, budget health |
| **Transactions** | CRUD, dynamic multi-criteria server-side filter, paginated table |
| **Categories** | CRUD with INCOME / EXPENSE typing |
| **Budgets** | Monthly per-category spending limits with live spent/remaining/% tracking |
| **Profile** | View & update account information |
| **Security** | Per-user data isolation at service layer, BCrypt passwords, CORS config |

---

## 🏗️ Architecture

```
FinTrack/
├── backend/                  # Spring Boot 3.4 modular monolith
│   ├── auth/                 # Registration, login, JWT token provider
│   ├── user/                 # User profile management
│   ├── category/             # Category CRUD (INCOME/EXPENSE)
│   ├── transaction/          # Transaction CRUD + JPA Specifications dynamic filter
│   ├── budget/               # Monthly budget management with live calculations
│   ├── dashboard/            # Cross-feature monthly aggregation endpoint
│   └── security/             # JWT filter chain, UserDetailsService, SecurityConfig
├── frontend/                 # Angular 22 Standalone SPA
│   └── src/app/
│       ├── core/             # AuthService (Signals), JWT interceptor, auth guard
│       ├── shared/           # LoadingSpinner, ConfirmDialog, EmptyState, CurrencySignPipe
│       └── features/
│           ├── auth/         # Login & Register pages
│           ├── dashboard/    # Monthly analytics dashboard
│           ├── categories/   # Category list & CRUD
│           ├── transactions/ # Paginated & filtered transaction table
│           ├── budgets/      # Budget health cards
│           └── profile/      # User account management
├── docker-compose.yml        # Multi-container orchestration (db + backend + frontend)
└── .env.example              # Environment variable template
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Java | 21+ (JDK 25 confirmed) |
| Maven | 3.9+ |
| Node.js | 22 LTS |
| npm | 10+ |
| Docker | 24+ |
| Docker Compose | V2 |

### Option 1 — Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/dinethkandegedara/FinTrack.git
cd FinTrack

# 2. Copy environment template and configure secrets
cp .env.example .env
# Edit .env: set DB_PASSWORD, JWT_SECRET (min 32 chars), etc.

# 3. Launch the full stack
docker compose up -d

# 4. Open in browser
# Frontend:  http://localhost:4200
# Backend API: http://localhost:8080/api
```

### Option 2 — Local Development

**Backend:**
```bash
# Requires a running PostgreSQL 17 instance
cd backend
cp src/main/resources/application-dev.properties.example \
   src/main/resources/application-dev.properties
# Edit DB credentials in application-dev.properties

mvn spring-boot:run -Dspring-boot.run.profiles=dev
# API available at: http://localhost:8080
```

**Frontend:**
```bash
cd frontend
npm install
npm start
# Dev server available at: http://localhost:4200
```

---

## 🔑 API Reference

All authenticated endpoints require:
```
Authorization: Bearer <jwt-token>
```

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create new user account |
| `POST` | `/api/auth/login` | Authenticate and receive JWT |
| `GET` | `/api/users/me` | Get current user profile |
| `PUT` | `/api/users/me` | Update full name |
| `GET/POST` | `/api/categories` | List / create categories |
| `GET/PUT/DELETE` | `/api/categories/{id}` | Read / update / delete category |
| `GET/POST` | `/api/transactions` | List (filtered+paginated) / create |
| `GET/PUT/DELETE` | `/api/transactions/{id}` | Read / update / delete transaction |
| `GET/POST` | `/api/budgets` | List (by month) / create budget |
| `GET/PUT/DELETE` | `/api/budgets/{id}` | Read / update / delete budget |
| `GET` | `/api/dashboard` | Monthly summary with budget health |

**Transaction filter params:** `type`, `categoryId`, `startDate`, `endDate`, `keyword`, `page`, `size`, `sort`

---

## 🧪 Running Tests

```bash
cd backend
mvn clean test
# Expected: 12 tests, 0 failures, 0 errors
```

Covered units: `AuthService`, `CategoryService`, `TransactionService`, `BudgetService`

---

## 🐳 Docker Architecture

```yaml
services:
  db:        # PostgreSQL 17 with health check
  backend:   # Spring Boot (depends_on: db healthy)
  frontend:  # Nginx 1.27 + compiled Angular SPA
```

All services share the `fintrack-net` bridge network. Only ports `5432`, `8080`, and `4200` are published to the host.

---

## 🔒 Security Design

- **Passwords:** BCrypt with strength 12 (Spring Security default)
- **JWT:** HMAC-SHA256 signed, 24h expiry, stateless validation per request
- **Data Isolation:** All queries filter on `userId` extracted from the JWT principal — users can never access other users' data
- **CORS:** Restricted to `http://localhost:4200` (configurable via `ALLOWED_ORIGINS`)

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Java 25 (OpenJDK), JDK 21 source compatibility |
| Framework | Spring Boot 3.4.3, Spring Security 6, Spring Data JPA |
| Database | PostgreSQL 17, Hibernate / HikariCP |
| Auth | JJWT 0.12.6 (HS256) |
| Frontend | Angular 22 (Standalone Components, Signals) |
| Styling | Vanilla CSS, Glassmorphism, CSS Custom Properties |
| Build | Maven 3.9, Angular CLI 22, Node 22 |
| Container | Docker multi-stage builds, Docker Compose V2 |

---

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.
