# 🌐 SkillSwap Exchange Web Application

SkillSwap Exchange is a full-stack, decentralized peer-to-peer knowledge sharing and mentorship web application.

---

## ⚡ Quick Links & Localhost Access

- 💻 **Web Application Frontend**: **[http://localhost:3000](http://localhost:3000)**
- 📱 **Mobile/Network Interface**: **[http://172.23.52.41:3000](http://172.23.52.41:3000)**
- ⚙️ **Backend REST API Server**: **[http://localhost:5001](http://localhost:5001)**

---

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons, Socket.IO Client.
- **Backend**: Node.js, Express, Socket.IO, Supabase Client & PostgreSQL.
- **Database & Auth**: Supabase PostgreSQL (`public.profiles`, `public.logins`, `public.skills`, `public.swaps`, `public.messages`).

---

## 🛠️ Installation & Execution Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

### 2. Run Web Application

From the project root directory:

```bash
# Start both Frontend and Backend concurrently
npm run dev
```

Or run services individually:

- **Start Web Frontend** (Port 3000):
  ```bash
  npm run dev:frontend
  ```

- **Start Backend API & Real-Time Socket.IO** (Port 5001):
  ```bash
  npm run dev:backend
  ```

---

## 🗄️ Database Setup (Supabase)

To link your live Supabase project to the web application:

1. Open your Supabase SQL Editor: **[https://supabase.com/dashboard/project/kxhqdsqqhdobxltefzsp/sql](https://supabase.com/dashboard/project/kxhqdsqqhdobxltefzsp/sql)**
2. Copy and execute the contents of **[supabase_setup.sql](supabase_setup.sql)**.
