# SkillSwap Platform (Web & Mobile APK)

SkillSwap is a full-stack platform for peer-to-peer skill exchange and mentorship available on both Web and Mobile Android.

## 📱 Mobile App (Android APK)

Download and install the native Android APK directly:

- 🚀 **[Download SkillSwap Android APK (SkillSwap.apk)](SkillSwap.apk)**

### APK Installation Instructions:
1. Download `SkillSwap.apk` onto your Android device or laptop.
2. Open the APK file on your Android device.
3. Allow "Install from unknown sources" if prompted by Android settings.
4. Tap **Install** to open and launch SkillSwap!

---

## 🌐 Web Application Setup

### Tech Stack
- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS, Lucide Icons, Socket.IO Client.
- **Backend**: Node.js, Express, Socket.IO, Supabase / MongoDB.
- **Android App**: Kotlin, Jetpack Compose, Retrofit.

### Getting Started

#### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

#### Installation & Setup

1. **Install Frontend Dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

#### Running the Web Application

From the root directory:

- **Run Frontend**:
  ```bash
  npm run dev:frontend
  ```
  The web frontend will be running at [http://localhost:3000](http://localhost:3000).

- **Run Backend**:
  ```bash
  npm run dev:backend
  ```
  The API backend server will be running at [http://localhost:5001](http://localhost:5001).

---

## Database Setup

The database tables and seed script can be set up in Supabase using `supabase_setup.sql`.
