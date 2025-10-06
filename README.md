# Firebase Studio

This app is linked to the Firebase project `studio-9077984486-1342b`.

## Prerequisites
- Node.js 18+
- npm 9+
- Firebase CLI (optional, for deployment)

## Environment Variables
Create a `.env.local` file with the following values (all are safe to expose to the browser):

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAjgQO1WD0X1QJNfj4aAB9EgJTB5kTkokY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-9077984486-1342b.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-9077984486-1342b
NEXT_PUBLIC_FIREBASE_APP_ID=1:751305193721:web:bc026bd9f50336a0938a28
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=751305193721
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
```

For server-side access (Firebase Admin SDK) provide your service account JSON via the `FIREBASE_SERVICE_ACCOUNT` environment variable. Example:

```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"studio-9077984486-1342b",...}
```

Tip: You can set this in a `.env.local` file with a single line by stringifying the JSON and replacing newlines with `\n`.

## Local Development

Install dependencies and start the dev server:

```
npm install
npm run dev
```

## Testing & Build

Run linting and build checks before committing:

```
npm run lint
npm run build
```

## Deployment

Deploy using Firebase App Hosting or your preferred platform. Ensure `FIREBASE_SERVICE_ACCOUNT` or `GOOGLE_APPLICATION_CREDENTIALS` is configured in the hosting environment for Admin SDK usage.

## Core Features

- **Product Inventory Dashboard**: A comprehensive table view of all products, showing key details like description, brand, expiration dates, and quantity on hand.
- **Advanced Filtering & Sorting**: Users can filter the product list by division and brand, or show only products with available inventory. The list can be sorted by various criteria, including projected sell-out date, description, brand, and available quantity.
- **Expiration Highlighting**: Products with a projected sell-out date in the past are highlighted in red to draw immediate attention.
- **Sales Commitments**: Sales reps can click "Commit" on any product to enter a quantity they pledge to sell. This updates the "Available" quantity for all users in real-time.
- **User-Specific Commitments**: The system tracks which user made which commitment. A "Users" page lists all sales reps, and clicking a user shows their specific commitments.
- **Secure Admin Role**: The application supports an `isAdmin` custom claim for performing privileged actions.
- **Client-Side Data Seeding**: An admin user can populate the Firestore database with initial product data directly from a page within the app.

## How It Works

The application is a modern web app built on Next.js and Firebase, demonstrating a secure and scalable architecture.

### Authentication

- **Firebase Authentication**: Handles user sign-up and login using email and password.
- **User Profiles**: When a user signs up, a corresponding user document is created in the `users` collection in Firestore to store their profile information.
- **Auth Guard**: Client-side logic (`AuthGuard`) protects all authenticated routes, redirecting unauthenticated users to the login page.

### Data Model & Firestore

- **Firestore**: The backend database is Cloud Firestore.
- **Collections**:
    - `/users/{userId}`: Stores public profile information for each user.
    - `/products/{productId}`: Stores all product inventory data.
    - `/users/{userId}/salesCommitments/{commitmentId}`: A sub-collection under each user to store the sales commitments they have made. This path-based ownership is a core part of the security model.
- **Real-Time Updates**: The app uses real-time listeners (`onSnapshot`) for Firestore, so changes made by one user (like making a commitment) are instantly reflected for all other users.

### Admin & Seeding Process

- To perform administrative tasks, a user must have an `isAdmin: true` custom claim on their Firebase Auth token.
- For development, a temporary feature exists on the `/seed-data` page. A user can click **"Make Me Admin"**, which securely calls a server-side API (`/api/set-admin`). This API uses the Firebase Admin SDK to grant the claim to the currently logged-in user.
- Once a user is an admin, the **"Seed Products"** button becomes active. This allows the admin to write the initial product data to the `products` collection from the client, an action permitted by the security rules.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN/UI](https://ui.shadcn.com/)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication & Firestore)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Fonts**: Inter & Space Grotesk
- **Deployment**: Firebase App Hosting

## Project Structure

```
/
├── public/                 # Static assets
├── src/
│   ├── app/                # Next.js App Router pages and routes
│   │   ├── api/            # API routes (e.g., for setting admin claims)
│   │   ├── (auth)/         # Route group for auth pages (login, signup)
│   │   ├── users/          # User list and user detail pages
│   │   ├── globals.css     # Global styles and Tailwind directives
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Main dashboard page
│   ├── components/
│   │   ├── ui/             # Reusable UI components from ShadCN
│   │   ├── app-shell.tsx   # Main application shell with sidebar
│   │   ├── auth-guard.tsx  # Protects routes requiring authentication
│   │   └── product-table.tsx # The main table for displaying products
│   ├── firebase/
│   │   ├── auth/           # Firebase Auth hooks (useUser)
│   │   ├── firestore/      # Firestore hooks (useCollection, useDoc)
│   │   ├── client-provider.tsx # Initializes Firebase on the client
│   │   ├── config.ts       # Firebase project configuration
│   │   └── index.ts        # Barrel file for exporting Firebase utilities
│   ├── hooks/              # Custom React hooks (e.g., use-toast)
│   └── lib/
│       ├── admin-actions.ts # Server-side functions using Firebase Admin SDK
│       ├── data.ts          # Sample product data for seeding
│       ├── firebase-admin.ts# Centralized Firebase Admin SDK initialization
│       ├── types.ts         # TypeScript type definitions
│       └── utils.ts         # Utility functions (e.g., cn for classnames)
├── docs/
│   └── backend.json        # Schema definition for Firestore data structures
├── firebase.json           # Firebase project configuration
├── firestore.rules         # Firestore security rules
└── next.config.ts          # Next.js configuration
```
