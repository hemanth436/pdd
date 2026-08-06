# 🌐 SkillSwap Exchange Web & Android Application

SkillSwap Exchange is a full-stack, decentralized peer-to-peer knowledge sharing and mentorship application supporting **Web Browsers** and **Android Mobile Devices**.

---

## ⚡ Quick Access Links

- 💻 **Web Application (Localhost)**: **[http://localhost:3000](http://localhost:3000)**
- 📱 **Android & Mobile Web Access**: **[http://<your-local-ip>:3000](http://<your-local-ip>:3000)**
- ⚙️ **Backend REST API & Real-Time Socket.IO**: **[http://<your-local-ip>:5001](http://<your-local-ip>:5001)**

---

## 🚀 Tech Stack

- **Frontend (Web & PWA)**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons, Socket.IO Client, Framer Motion.
- **Backend API**: Node.js, Express, Socket.IO (WebSockets & WebRTC Signaling), Supabase Client & PostgreSQL.
- **Mobile Integration (Android)**: Capacitor Android Native Bridge, Responsive Touch UI, Dynamic API Host Resolver.
- **Database & Auth**: Supabase PostgreSQL (`public.profiles`, `public.logins`, `public.skills`, `public.swaps`, `public.messages`).

---

## 🛠️ Installation & Execution Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- npm
- (Optional for Native Android APK): Android Studio & Android SDK

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

### 2. Run Web & Mobile Application

From the project root directory:

```bash
# Start both Frontend (0.0.0.0:3000) and Backend (0.0.0.0:5001)
npm run dev
```

Or run services individually:

- **Start Web & Mobile Frontend** (Port 3000):
  ```bash
  npm run dev:frontend
  ```

- **Start Backend REST API & Real-Time Socket.IO** (Port 5001):
  ```bash
  npm run dev:backend
  ```

---

## 📱 Building & Running Native Android APK

To generate a native Android Studio project and `.apk` bundle:

```bash
# Navigate to frontend
cd frontend

# Build production web bundle
npm run build

# Add Android native platform (first time only)
npx cap add android

# Copy web bundle to Android project
npx cap copy android

# Open Android Studio to build APK or run on Android Device/Emulator
npx cap open android
```

---

## 🗄️ Database Setup (Supabase)

To link your live Supabase project to the application:

1. Open your Supabase SQL Editor: **[https://supabase.com/dashboard/project/kxhqdsqqhdobxltefzsp/sql](https://supabase.com/dashboard/project/kxhqdsqqhdobxltefzsp/sql)**
2. Copy and execute the contents of **[supabase_setup.sql](supabase_setup.sql)**.
