# Points Management System

A NestJS application for managing user points across multiple payers with transaction tracking.

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (version 18 or higher) - Download from https://nodejs.org/
- npm (comes with Node.js)

## Installation

1. Clone this repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

## Running the Application Locally

Start the development server (with hot reload):

```bash
npm run start:dev
```

Or start the production build locally:

```bash
npm run build
npm run start:prod
```

The server will start on `http://localhost:3000`.

## Running the Application with Docker

### Build the Docker image

From the project root:

```bash
docker build -t points-management-system .
```

### Run the container

```bash
docker run -p 3000:3000 --name points-app points-management-system
```

The API will be available at `http://localhost:3000` and Swagger docs at `http://localhost:3000/api`.

## API Endpoints

### 1. Add Transaction

**POST** `/points/add`

Add a new transaction for a specific payer.

**Request Body:**

```json
{
  "payer": "SHOPIFY",
  "points": 1000,
  "timestamp": "2024-07-02T14:00:00Z"
}
```

### 2. Spend Points

**POST** `/points/spend`

Spend points following the rules: oldest points first, no payer goes negative.

**Request Body:**

```json
{
  "points": 5000
}
```

**Response:**

```json
[
  { "payer": "SHOPIFY", "points": -100 },
  { "payer": "EBAY", "points": -200 },
  { "payer": "AMAZON", "points": -4700 }
]
```

### 3. Get Balances

**GET** `/points/balance`

Get current balance for all payers.

**Response:**

```json
{
  "SHOPIFY": 1000,
  "EBAY": 0,
  "AMAZON": 5300
}
```

## Testing the Example Scenario

Run these commands in order to test the example from the requirements:

```bash
# Add transactions
curl -X POST http://localhost:3000/points/add -H "Content-Type: application/json" -d '{"payer": "SHOPIFY", "points": 1000, "timestamp": "2024-07-02T14:00:00Z"}'
curl -X POST http://localhost:3000/points/add -H "Content-Type: application/json" -d '{"payer": "EBAY", "points": 200, "timestamp": "2024-06-30T11:00:00Z"}'
curl -X POST http://localhost:3000/points/add -H "Content-Type: application/json" -d '{"payer": "SHOPIFY", "points": -200, "timestamp": "2024-06-30T15:00:00Z"}'
curl -X POST http://localhost:3000/points/add -H "Content-Type: application/json" -d '{"payer": "AMAZON", "points": 10000, "timestamp": "2024-07-01T14:00:00Z"}'
curl -X POST http://localhost:3000/points/add -H "Content-Type: application/json" -d '{"payer": "SHOPIFY", "points": 300, "timestamp": "2024-06-30T10:00:00Z"}'

# Spend points
curl -X POST http://localhost:3000/points/spend -H "Content-Type: application/json" -d '{"points": 5000}'

# Check balances
curl http://localhost:3000/points/balance
```

## Project Structure

```
src/
├── points/
│   ├── dto/                    # Data Transfer Objects
│   ├── interfaces/             # TypeScript interfaces
│   ├── points.controller.ts    # HTTP route handlers
│   ├── points.service.ts       # Business logic
│   └── points.module.ts        # Module definition
├── app.module.ts               # Root module
└── main.ts                     # Application entry point
```

## Notes

- Data is stored in memory and will be lost when the server restarts
- No authentication or authorization is implemented
- Timestamps should be in ISO 8601 format
