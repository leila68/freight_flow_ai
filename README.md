# Freight Flow AI

A production-grade freight brokerage platform powered by AI-driven rate intelligence, semantic search, and a modern quoting engine.

## 🚀 Tech Stack

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js
- TypeScript

### Database & AI
- PostgreSQL
- pgvector
- RAG (Retrieval-Augmented Generation)
- Semantic Search
- AI Chatbot

### DevOps
- Docker
- Docker Compose

---

# 📁 Project Structure

```bash
freightflow-ai/
├── frontend/                 # React + Vite + TypeScript + Tailwind
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   └── db/
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml        # Postgres + pgvector + backend + frontend
├── package.json              # Root workspace scripts
└── .env.example

```bash
backend/
├── src/
│   ├── index.ts
│   │   # Application entry point & Express server bootstrap
│   │
│   ├── config/
│   │   └── env.ts
│   │       # Environment variable validation using Zod
│   │
│   ├── db/
│   │   ├── client.ts
│   │   │   # PostgreSQL connection pool singleton
│   │   │
│   │   ├── migrate.ts
│   │   │   # Executes SQL migration files
│   │   │
│   │   └── migrations/
│   │       └── 001_initial.sql
│   │           # Initial database schema + seed data
│   │
│   ├── routes/
│   │   ├── index.ts
│   │   │   # Mounts all API routes
│   │   │
│   │   ├── quotes.ts
│   │   │   # Quote endpoints
│   │   │   # POST /quotes
│   │   │   # GET /quotes
│   │   │
│   │   ├── lanes.ts
│   │   │   # Lane lookup & autocomplete endpoints
│   │   │   # GET /lanes
│   │   │
│   │   └── health.ts
│   │       # Health check endpoint for Docker/Kubernetes
│   │       # GET /health
│   │
│   ├── services/
│   │   ├── quoteService.ts
│   │   │   # Freight quote business logic & rate calculations
│   │   │
│   │   └── laneService.ts
│   │       # Lane search, lookup, and suggestions
│   │
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   │   # Global API error handler
│   │   │
│   │   └── validate.ts
│   │       # Generic Zod request validation middleware
│   │
│   ├── schemas/
│   │   └── quote.ts
│   │       # Zod schemas for quote validation
│   │
│   └── types/
│       └── index.ts
│           # Shared TypeScript interfaces & types
│
├── Dockerfile
│   # Backend container configuration
│
├── package.json
│   # Backend dependencies & scripts
│
├── .env.example
│   # Example environment variables
│
└── tsconfig.json
    # TypeScript compiler configuration
```


