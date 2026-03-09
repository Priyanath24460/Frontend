# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for the LawKnow Frontend.

## Prerequisites
- A Google account
- Node.js and npm installed

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or select an existing project
3. Follow the setup wizard to create your project

## Step 2: Enable Authentication

1. In your Firebase project dashboard, click on "Authentication" in the left sidebar
2. Click "Get Started"
3. Go to the "Sign-in method" tab
4. Enable the following providers:
   - **Email/Password**: Click on it, toggle Enable, and Save
   - **Google**: Click on it, toggle Enable, provide a project support email, and Save

## Step 3: Register Your Web App

1. In the Firebase project overview, click the web icon (</>) to add a web app
2. Give your app a nickname (e.g., "LawKnow Frontend")
3. Optional: Enable Firebase Hosting (not required for this setup)
4. Click "Register app"

## Step 4: Get Your Firebase Configuration

1. After registering, you'll see your Firebase configuration object
2. Copy the configuration values (apiKey, authDomain, etc.)
3. Create a `.env` file in the `Frontend` folder
4. Copy the contents from `.env.example` and fill in your values:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

## Step 5: Update Firebase Configuration File

Open `src/config/firebase.js` and replace the placeholder values with your environment variables:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
```

## Step 6: Configure Authorized Domains

1. In Firebase Console, go to Authentication > Settings > Authorized domains
2. Add your development domain (usually `localhost` is already there)
3. Add your production domain when deploying

## Step 7: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the register page and create a test account
3. Try logging in with the created account
4. Test Google sign-in

## Features Included

✅ **Email/Password Authentication**
- User registration with email and password
- Login with email and password
- Password validation (minimum 6 characters)

✅ **Google Sign-In**
- One-click Google authentication
- Automatic profile setup

✅ **Protected Routes**
- Routes requiring authentication redirect to login
- User context available throughout the app

✅ **User Profile**
- Display name and email
- User avatar with initials
- Profile dropdown menu

✅ **Session Management**
- Automatic session persistence
- Logout functionality
- Loading states

## Troubleshooting

### Firebase not initializing
- Check if your `.env` file is in the Frontend folder (not the root)
- Restart your development server after creating/updating `.env`
- Verify all environment variables start with `VITE_`

### Authentication errors
- Ensure Email/Password is enabled in Firebase Console
- Check if authorized domains include your current domain
- Verify your Firebase configuration values are correct

### Google Sign-In not working
- Enable Google provider in Firebase Console
- Add project support email in Google provider settings
- Check browser console for specific error messages

## Security Notes

⚠️ **Important Security Practices:**

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use Firebase Security Rules** - Configure Firestore/Storage rules
3. **Enable App Check** - Protect your Firebase resources (optional but recommended)
4. **Set up reCAPTCHA** - For production, enable reCAPTCHA for authentication

## Additional Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [React Firebase Tutorial](https://firebase.google.com/docs/auth/web/start)
- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/basics)

## Support

If you encounter any issues, check:
1. Firebase Console for error logs
2. Browser console for client-side errors
3. Network tab to see failed requests

For more help, refer to the [Firebase Support](https://firebase.google.com/support) page.
