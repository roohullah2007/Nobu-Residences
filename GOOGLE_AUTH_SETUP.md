# Google OAuth Setup Guide

## Overview
Google OAuth authentication has been integrated into the application, allowing users to sign in and sign up using their Google accounts.

## Setup Instructions

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - For local development: `http://127.0.0.1:8000/auth/google/callback`
     - For production: `https://yourdomain.com/auth/google/callback`
   - Save and copy the Client ID and Client Secret

### 2. Configure Environment Variables

Update your `.env` file with the Google OAuth credentials:

```env
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback
```

For production, update the `GOOGLE_REDIRECT_URI` to match your domain:
```env
GOOGLE_REDIRECT_URI=https://yourdomain.com/auth/google/callback
```

### 3. Run Migrations

The migration for Google OAuth fields has already been created and run. If you're setting up a fresh installation, run:

```bash
php artisan migrate
```

## Features Implemented

### Backend
- **Laravel Socialite Integration**: Handles OAuth flow with Google
- **Database Schema**: Added fields to users table:
  - `google_id`: Stores Google user ID
  - `avatar`: Stores user's Google profile picture
  - `provider`: OAuth provider name (google)
  - `provider_id`: Provider-specific user ID
  - `password`: Made nullable for OAuth users

### Frontend
- **Google Login Button Component**: Reusable React component with Google branding
- **Login Page Integration**: "Sign in with Google" option on login page
- **Register Page Integration**: "Sign up with Google" option on registration page

## How It Works

1. **User clicks "Sign in with Google"**: Redirects to Google OAuth consent screen
2. **User authorizes the app**: Google redirects back with authorization code
3. **Backend processes callback**: 
   - Retrieves user information from Google
   - Creates new user or updates existing user
   - Logs the user in automatically
4. **User is redirected**: Sent to dashboard or intended page

## User Flow

### New Users
- Click "Sign up with Google" on register page
- Authorize the app on Google
- Account is created automatically with:
  - Name from Google profile
  - Email from Google account
  - Profile picture from Google
  - Random secure password (not needed for login)
  - Email marked as verified

### Existing Users
- If email already exists in database:
  - Google ID is linked to existing account
  - User can now login with both password and Google
- Profile picture is updated if not already set

## Security Considerations

1. **Email Verification**: Google OAuth users are automatically verified
2. **Password**: OAuth users get a random secure password but don't need it
3. **Provider Tracking**: System tracks which provider was used for authentication
4. **HTTPS Required**: In production, always use HTTPS for OAuth callbacks

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Ensure the redirect URI in Google Console matches exactly with `.env`
   - Check for trailing slashes
   - Verify protocol (http vs https)

2. **"Client ID not found" error**
   - Verify GOOGLE_CLIENT_ID in `.env` is correct
   - Clear config cache: `php artisan config:clear`

3. **User creation fails**
   - Check database migration ran successfully
   - Verify `users` table has Google OAuth fields

## Testing

1. **Local Testing**:
   ```bash
   php artisan serve
   npm run dev
   ```
   Visit: http://127.0.0.1:8000/login

2. **Test Scenarios**:
   - New user registration via Google
   - Existing user linking Google account
   - Login with Google after registration
   - Multiple login methods for same email

## Production Deployment

1. Update `.env` with production credentials
2. Update Google Console with production redirect URI
3. Clear caches:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```
4. Ensure HTTPS is configured
5. Test OAuth flow in production environment

## Support

For issues or questions about the Google OAuth implementation, check:
- Laravel Socialite documentation
- Google OAuth 2.0 documentation
- Application logs in `storage/logs/laravel.log`