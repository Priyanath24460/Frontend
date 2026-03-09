# 🎨 Authentication UI Overview

## Page Designs

### 1. Login Page (`/login`)
```
┌─────────────────────────────────────────────────────┐
│  Header (with LawKnow logo)                         │
└─────────────────────────────────────────────────────┘

         ┌────────────────────────────────┐
         │   🔐  Welcome Back            │
         │   Sign in to access your      │
         │   account                     │
         │                               │
         │   Email Address               │
         │   [________________]          │
         │                               │
         │   Password                    │
         │   [________________]          │
         │                               │
         │   Forgot your password?       │
         │                               │
         │   [   Sign In Button   ]      │
         │                               │
         │   ─── Or continue with ───    │
         │                               │
         │   [ 🔍 Sign in with Google ]  │
         │                               │
         │   Don't have an account?      │
         │   Sign up                     │
         └────────────────────────────────┘
```

### 2. Register Page (`/register`)
```
┌─────────────────────────────────────────────────────┐
│  Header (with LawKnow logo)                         │
└─────────────────────────────────────────────────────┘

         ┌────────────────────────────────┐
         │   ✨  Create Account           │
         │   Join LawKnow to access       │
         │   legal research tools         │
         │                               │
         │   Full Name                   │
         │   [________________]          │
         │                               │
         │   Email Address               │
         │   [________________]          │
         │                               │
         │   Password                    │
         │   [________________]          │
         │                               │
         │   Confirm Password            │
         │   [________________]          │
         │                               │
         │   [ Create Account Button ]   │
         │                               │
         │   ─── Or continue with ───    │
         │                               │
         │   [ 🔍 Sign up with Google ]  │
         │                               │
         │   By signing up, you agree to │
         │   our Terms & Privacy Policy  │
         │                               │
         │   Already have an account?    │
         │   Sign in                     │
         └────────────────────────────────┘
```

### 3. Header - Not Logged In
```
┌─────────────────────────────────────────────────────────────────┐
│  LawKnow  Home  Features ▼  About  [ Sign In ] [ Get Started ] │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Header - Logged In
```
┌─────────────────────────────────────────────────────────────────┐
│  LawKnow  Home  Features ▼  About  [ 👤 John Doe ▼ ]           │
│                                     ┌──────────────┐             │
│                                     │ Signed in as │             │
│                                     │ john@ex.com  │             │
│                                     ├──────────────┤             │
│                                     │ 👤 Profile   │             │
│                                     │ 🚪 Sign Out  │             │
│                                     └──────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### 5. Features Dropdown (when authenticated)
```
┌─────────────────────────────────────────────────────┐
│  Features                                      ▼   │
│  ┌───────────────────────────────────────────┐    │
│  │ 🔍 Scenario-Based Case Finder            │    │
│  │    Find relevant cases using natural...   │    │
│  │                                           │    │
│  │ 📄 AI Case Summarizer                    │    │
│  │    Summarize complex judgments...         │    │
│  │                                           │    │
│  │ 📋 Contract Risk Identification           │    │
│  │    Review and create contracts...         │    │
│  │                                           │    │
│  │ 🛡️ Fundamental Rights Screener           │    │
│  │    Check for constitutional rights...     │    │
│  └───────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

## Authentication Flow Diagram

```
┌─────────────┐
│    Start    │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  Visit App      │
└──────┬──────────┘
       │
       ▼
    ┌──────────────────┐
    │ User Logged In?  │
    └────┬─────────┬───┘
         │         │
    Yes  │         │ No
         │         │
         ▼         ▼
    ┌────────┐  ┌────────────┐
    │ Show   │  │ Show Login │
    │ Avatar │  │ & Register │
    │ Menu   │  │  Buttons   │
    └────────┘  └──────┬─────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Click Protected │
              │     Route       │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Redirect to     │
              │     /login      │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Enter Email &   │
              │    Password     │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Firebase Auth  │
              └────────┬────────┘
                       │
            Success    │
                       ▼
              ┌─────────────────┐
              │ Redirect to     │
              │ Original Page   │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Access Granted  │
              └─────────────────┘
```

## User Journey

### New User Sign Up:
1. **Visit Homepage** → See "Get Started" button
2. **Click "Get Started"** → Navigate to `/register`
3. **Fill Registration Form** → Name, Email, Password
4. **Submit** → Firebase creates account
5. **Auto Login** → Redirected to homepage
6. **See Avatar** → User menu appears in header

### Existing User Login:
1. **Visit Homepage** → See "Sign In" button
2. **Click "Sign In"** → Navigate to `/login`
3. **Enter Credentials** → Email & Password
4. **Submit** → Firebase authenticates
5. **Success** → Redirected to homepage
6. **Access Features** → All protected routes available

### Google Sign In:
1. **Visit Login/Register** → See "Sign in with Google"
2. **Click Google Button** → Google popup opens
3. **Select Account** → Choose Google account
4. **Grant Permissions** → Allow access
5. **Auto Login** → Redirected to homepage
6. **Profile Created** → Uses Google name & email

### Accessing Protected Route:
1. **Not Logged In** → Click on "Case Summarizer"
2. **Intercepted** → ProtectedRoute checks auth
3. **Redirect** → Sent to `/login`
4. **Login** → Enter credentials
5. **Auto Navigate** → Back to Case Summarizer
6. **Access Granted** → Page loads normally

### Logging Out:
1. **Click Avatar** → User menu dropdown opens
2. **Click "Sign Out"** → Logout function called
3. **Firebase Signs Out** → Session cleared
4. **Update UI** → Avatar removed, Login buttons appear
5. **Redirect** → Sent to homepage
6. **Protected Routes** → Now require login again

## Color Scheme

```
┌────────────────────────────────────┐
│  Primary Colors                    │
├────────────────────────────────────┤
│  🟧 Amber-400   #fbbf24            │
│  🟠 Orange-400  #fb923c            │
│  ⬛ Stone-900   #1c1917            │
│  ⬜ White       #ffffff            │
├────────────────────────────────────┤
│  Gradient Buttons                  │
│  [Amber-400 → Orange-400]          │
├────────────────────────────────────┤
│  Background Gradient               │
│  [Stone-900 → Stone-800 → Amber-900]│
└────────────────────────────────────┘
```

## Component States

### Input Fields:
- **Normal**: Stone background, gray border
- **Focus**: Amber glow, highlighted border
- **Error**: Red border, error message below

### Buttons:
- **Normal**: Amber gradient with shadow
- **Hover**: Lighter gradient, lift effect
- **Loading**: Opacity reduced, "Loading..." text
- **Disabled**: Gray, no hover effects

### Dropdowns:
- **Closed**: Normal menu item
- **Hover**: Background highlight
- **Open**: Dropdown panel with backdrop blur

## Responsive Design

### Desktop (≥768px):
- Full navigation in header
- Side-by-side layout for forms
- Dropdown menus on hover
- Full-width content areas

### Mobile (<768px):
- Hamburger menu (if implemented)
- Stacked form layout
- Bottom sheet menus
- Full-screen dropdowns

## Security Indicators

### Visual Security Features:
1. **🔒 HTTPS** - Secure connection (in production)
2. **Password Hidden** - type="password" fields
3. **Email Validation** - Real-time format check
4. **Error Messages** - Clear feedback on failures
5. **Loading States** - Prevent double submissions

## Accessibility Features

- ✅ Proper form labels
- ✅ ARIA attributes where needed
- ✅ Keyboard navigation support
- ✅ Focus indicators
- ✅ Screen reader friendly
- ✅ Semantic HTML structure

---

**Design System**: Tailwind CSS with custom amber/orange gradient theme  
**Component Library**: Custom React components  
**Icons**: Heroicons (SVG)  
**Fonts**: System fonts with fallbacks
