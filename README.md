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
