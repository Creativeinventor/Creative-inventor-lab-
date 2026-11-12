# Creative Inventor Project Portal

Production-grade subscription-based project download portal for the **Creative Inventor** YouTube community ([@creativeinventorlab](https://youtube.com/@creativeinventorlab)).

---

## ⚡ Business Model & Architectural Principles

- **Administrator-Governed**: The channel owner manually creates every subscriber account from the Admin Panel.
- **Manual Credentials & Durations**: Unique User IDs (e.g. `CI1001`), secure password setup tokens, and subscription durations (7, 15, 30, 90, 180, 365 days, or custom) are assigned manually upon membership verification on YouTube/WhatsApp.
- **No Payment Gateway & No Public Registration**: Public registration and automated billing are completely disabled by design.
- **Selective Project Access**: The administrator can assign specific projects to individual users, groups, or broadcast access to all active subscribers.
- **Zero Direct Downloads**: All file downloads are authorized server-side through Vercel Serverless / Firebase Admin SDK, generating short-lived 15-minute signed URLs.
- **Asia/Kolkata Timezone**: All user-facing dates are localized to Indian Standard Time (IST), while internal timestamps are stored strictly in UTC ISO 8601.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide React, JetBrains Mono & Plus Jakarta Sans |
| **Backend** | Vercel Serverless Functions (`api/*`), Express dev middleware (`server.ts`) |
| **Database** | Firebase Firestore (hardened ABAC Security Rules & Indexes) |
| **Authentication** | Firebase Authentication (Admin SDK creation & Session Verification) |
| **File Storage** | Firebase Cloud Storage (Private storage with short-lived signed download URLs) |
| **Email Delivery** | Resend API (Branded HTML transactional emails for Welcome, Expiry, Suspension) |
| **Deployment** | GitHub Repository & Vercel Serverless Platform |

---

## 📁 Repository Structure

```
creative-inventor-portal/
├── api/                               # Vercel Serverless Functions & Backend API
│   ├── auth/                          # Login, session verification, password setup
│   ├── admin/                         # User creation, projects, assignments, stats, logs
│   ├── projects/                      # Subscriber project queries
│   ├── downloads/                     # 5-point secure download verification
│   ├── cron/                          # Automated subscription expiry runner
│   ├── health.ts                      # System diagnostics & service status
│   └── lib/                           # Firebase Admin SDK, Resend, Mock Fallback Store
├── firebase/
│   ├── firestore.rules                # Hardened Firestore ABAC security rules
│   ├── storage.rules                  # Private Cloud Storage security rules
│   └── firestore.indexes.json         # Composite indexes for sorted queries
├── src/
│   ├── assets/images/                 # High-resolution generated electronic project assets
│   ├── components/                    # StatusBadge, ProjectCard, Modal, SetupBanner, etc.
│   ├── contexts/                      # AuthContext with quick role-testing switcher
│   ├── layouts/                       # AdminLayout & SubscriberLayout
│   ├── pages/
│   │   ├── LoginPage.tsx              # Credentials sign-in & quick test presets
│   │   ├── SetupPasswordPage.tsx      # Welcome link password activation
│   │   ├── admin/                     # Dashboard, Users, Projects, Assignments, Logs
│   │   └── subscriber/                # Dashboard, Projects, Downloads, Profile
│   ├── services/                      # API client, dateUtils (IST/UTC), firebase client
│   └── types/                         # TypeScript interfaces
├── vercel.json                        # Vercel Serverless rewrite configuration
├── package.json
└── tsconfig.json
```

---

## 🚀 Step-by-Step Deployment Guide

### Step 1: Firebase Project Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project (e.g. `creative-inventor-portal`).
2. **Enable Firebase Authentication**:
   - Go to **Authentication** > **Sign-in method**.
   - Enable **Email/Password**.
3. **Create Firestore Database**:
   - Go to **Firestore Database** > **Create database** in **Production mode**.
   - Set the location closest to your users (e.g., `asia-south1` for Mumbai).
4. **Deploy Firestore Rules & Indexes**:
   - Install Firebase CLI if not already installed: `npm install -g firebase-tools`
   - Log in: `firebase login`
   - Deploy rules: `firebase deploy --only firestore:rules,firestore:indexes,storage`
   - Alternatively, copy the contents of `firebase/firestore.rules` and `firebase/storage.rules` directly into the Firebase Console rules editor.
5. **Get Client Configuration**:
   - Go to **Project Settings** > **General** > **Your apps** > Add a **Web app**.
   - Copy the configuration values into your `.env` file (see Environment Variables below).
6. **Generate Admin SDK Service Account**:
   - Go to **Project Settings** > **Service accounts** > Click **Generate new private key**.
   - Open the downloaded JSON file to retrieve `project_id`, `client_email`, and `private_key`.

---

### Step 2: Resend Email Setup

1. Sign up at [Resend](https://resend.com/).
2. Go to **API Keys** and generate a new key (`RESEND_API_KEY`).
3. Add and verify your custom sending domain, or use the default test sender:
   ```env
   RESEND_FROM_EMAIL="Creative Inventor <portal@yourdomain.com>"
   ```

---

### Step 3: Configure Environment Variables

Create a `.env` file in the project root based on `.env.example`:

```env
# Client-Side Firebase
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="creative-inventor-portal.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="creative-inventor-portal"
VITE_FIREBASE_STORAGE_BUCKET="creative-inventor-portal.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:..."

# Server-Side Firebase Admin SDK (Keep secret!)
FIREBASE_PROJECT_ID="creative-inventor-portal"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@creative-inventor-portal.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Resend Email
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="Creative Inventor <onboarding@yourdomain.com>"

# App Settings
APP_URL="https://your-vercel-domain.vercel.app"
CRON_SECRET="your-secret-cron-key-12345"
```

---

---

### Step 4: Initial Admin Setup & Credentials

The portal implements automatic one-time Admin bootstrapping and username-to-email resolution.

1. **Configure Admin Credentials in `.env` (or Vercel Environment Variables)**:
   ```env
   # Admin User ID used on the login screen
   ADMIN_USER_ID="admin"

   # Valid administrator email address for Firebase Authentication
   ADMIN_EMAIL="20sgamingrohit@gmail.com"

   # Initial password (configurable; change to a strong secret in production)
   ADMIN_INITIAL_PASSWORD="123"

   # Display Name
   ADMIN_NAME="Administrator"
   ```

2. **Run Local Development**:
   ```bash
   npm run dev
   ```
   On server start, `ensureInitialAdmin()` automatically verifies or creates the Admin profile in Firebase Auth and Firestore under `users/{uid}` (`role: "admin"`, `status: "active"`, `createdAt: serverTimestamp()`).

3. **Log in at `http://localhost:3000`**:
   - **Admin Login**:
     - **User ID**: `admin` (or `20sgamingrohit@gmail.com`)
     - **Password**: `123` (or your configured `ADMIN_INITIAL_PASSWORD`)
     - *Backend resolves `admin` to your email, validates with Firebase Auth, verifies `role === 'admin'` and `status === 'active'` in Firestore, and grants full access to the Admin Dashboard.*
   - **Subscriber Login**:
     - **User ID**: `CI1001` (or `rahul@example.com`)
     - **Password**: `subscriber123`
     - *Subscribers can access only assigned projects and are barred from Admin routes.*

4. **Production Security Best Practice**:
   - For live deployment on Vercel, set `ADMIN_INITIAL_PASSWORD` to a strong random passphrase (e.g. `CI_Admin_Sec!9982`).
   - Do not leave the password as `123` in public production environments.


---

### Step 5: Deploy to GitHub & Vercel

1. Initialize a git repository and commit the code (the `.gitignore` file already protects all `.env` files and private keys):
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Creative Inventor Project Portal"
   git remote add origin https://github.com/your-username/creative-inventor-portal.git
   git push -u origin main
   ```
2. Log in to [Vercel](https://vercel.com/) and click **Add New Project** > **Import Git Repository**.
3. In the Vercel **Environment Variables** panel, paste all variables from your `.env` file.
4. Click **Deploy**. Vercel will build the React frontend and automatically mount each serverless function under `/api/*`.

---

### Step 6: Automated Expiry Cron Job (Optional)

In your `vercel.json`, configure a periodic cron job to automatically check subscriptions and dispatch reminder emails:

```json
{
  "crons": [
    {
      "path": "/api/cron/subscription-check",
      "schedule": "0 0 * * *"
    }
  ]
}
```

The endpoint verifies the `CRON_SECRET` header to protect against unauthorized triggers.

---

## 🔒 Security Specifications

- **Server-Side Authentication**: Passwords and session integrity are handled via Firebase Authentication and serverless token validation.
- **Defensive Download Verification**: Before any file download URL is produced, the backend independently verifies:
  1. Valid session authentication.
  2. Account is in `ACTIVE` status (not `DISABLED`).
  3. Subscription timestamp has not expired.
  4. Project is explicitly assigned to this subscriber in Firestore.
  5. The requested file ID belongs to the authorized project.
- **Audit Logging**: Every login attempt and file download records the User ID, File ID, Timestamp (IST), and IP address.
- **Zero Direct Public Storage Access**: Firestore and Storage rules prohibit direct public reading of project files.
