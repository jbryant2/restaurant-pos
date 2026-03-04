# Restaurant POS System

A full-stack point-of-sale application for restaurant management built with Java Spring Boot, Angular, and PostgreSQL.

## Tech Stack

**Backend**
- Java 21
- Spring Boot 4.0.3
- Spring Data JPA, Spring Security, Spring Validation
- PostgreSQL (production) / H2 (development)
- Lombok

**Frontend**
- Angular 21
- Angular Material
- TypeScript 5.9

## Features

- **Table management** — track table status (available, occupied, reserved, maintenance), capacity, and location
- **Menu management** — manage items with pricing, categories, availability, and images
- **Order management** — create orders per table, add/remove items, track order status through lifecycle, auto-calculate totals
- **Inventory tracking** *(coming soon)*
- **Sales reporting** *(coming soon)*
- **Role-based authentication** *(coming soon)*

## Getting Started

### Prerequisites

- Java 21+
- Node.js 22 LTS
- Maven (or use the included `mvnw` wrapper)

### Run the Backend

```bash
cd backend
./mvnw spring-boot:run
```

Starts on `http://localhost:8080`. Uses an H2 in-memory database by default — no database setup required for development.

**H2 Console:** `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:posdb`
- Username: `sa`
- Password: *(empty)*

### Run the Frontend

```bash
cd frontend
npm install
ng serve
```

Starts on `http://localhost:4200`.

## API Endpoints

### Tables `/api/tables`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tables` | Get all tables |
| GET | `/api/tables/{id}` | Get table by ID |
| GET | `/api/tables/status/{status}` | Filter by status |
| GET | `/api/tables/available/{partySize}` | Get available tables for party size |
| POST | `/api/tables` | Create a table |
| PUT | `/api/tables/{id}` | Update a table |
| PATCH | `/api/tables/{id}/status?status=` | Update table status |
| DELETE | `/api/tables/{id}` | Delete a table |

### Menu Items `/api/menu-items`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/menu-items` | Get all menu items |
| GET | `/api/menu-items/{id}` | Get item by ID |
| POST | `/api/menu-items` | Create a menu item |

### Orders `/api/orders`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders/{id}` | Get order by ID |
| GET | `/api/orders/table/{tableId}` | Get orders for a table |
| GET | `/api/orders/status/{status}` | Filter by status |
| POST | `/api/orders` | Create an order `{ tableId, notes }` |
| POST | `/api/orders/{id}/items` | Add item `{ menuItemId, quantity, notes }` |
| DELETE | `/api/orders/{id}/items/{itemId}` | Remove item from order |
| PATCH | `/api/orders/{id}/status?status=` | Update order status |
| DELETE | `/api/orders/{id}` | Delete an order |

**Order statuses:** `PENDING` → `IN_PROGRESS` → `READY` → `COMPLETED` / `CANCELLED`

## Project Structure

```
restaurant-pos/
├── backend/
│   └── src/main/java/com/restaurantpos/backend/
│       ├── config/          # Security and CORS configuration
│       ├── controller/      # REST controllers
│       ├── model/           # JPA entities
│       ├── repository/      # Spring Data repositories
│       └── service/         # Business logic
└── frontend/
    └── src/app/
        ├── features/        # Feature modules (auth, menu, orders, pos)
        ├── services/        # Angular services
        └── shared/          # Shared module
```
