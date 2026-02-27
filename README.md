# Incohub Maintenance Management System

A professional grade Maintenance and Production Registry built for Craft Paper Manufacturing Units.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL Database
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd craftpaperrecordmachine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Copy `.env.example` to `.env` and fill in your client-specific credentials.
   ```bash
   cp .env.example .env
   ```
   Provide your `DATABASE_URL` in the following format:
   `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`

4. **Database Initialization**
   Run the following commands to set up the schema and seed initial data.
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start Application**
   ```bash
   npm run dev
   ```

## 🛠️ Production Deployment

For production environments, follow these steps:

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

3. **CI/CD Recommendation**
   - Connect the GitHub repository to Vercel or your preferred VPS provider.
   - Ensure the `DATABASE_URL` environment variable is securely configured in your deployment platform's dashboard.

## 📁 Project Structure

- `src/app`: Next.js App Router (Pages & API Routes)
- `src/components`: Reusable UI components
- `prisma`: Database schema and migrations
- `public`: Static assets

## ⚖️ License
This software is provided to the client for their internal manufacturing operations.
