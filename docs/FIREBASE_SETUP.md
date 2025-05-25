# Firebase Setup for Announcement Module

## Overview
The announcement module uses Firebase for real-time updates and enhanced user experience. This document explains how to set up Firebase for the project.

## Prerequisites
- Firebase account
- Firebase project created
- Firebase CLI installed (optional)

## Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "otls-announcements")
4. Follow the setup wizard

### 2. Enable Firestore Database
1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development
4. Select a location for your database

### 3. Get Firebase Configuration
1. In Firebase Console, go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web (</>) 
4. Register your app with a nickname
5. Copy the configuration object

### 4. Environment Variables
Add the following variables to your `.env.local` file:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 5. Firestore Security Rules
Update your Firestore security rules to allow read/write access for authenticated users:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Announcements collection
    match /announcements/{announcementId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.auth.token.role == 'Teacher' || 
         request.auth.token.role == 'Admin');
    }
    
    // Comments collection
    match /comments/{commentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.authorId == request.auth.uid ||
         request.auth.token.role == 'Teacher' ||
         request.auth.token.role == 'Admin');
      allow delete: if request.auth != null && 
        (resource.data.authorId == request.auth.uid ||
         request.auth.token.role == 'Teacher' ||
         request.auth.token.role == 'Admin');
    }
  }
}
```

## Features Provided

### Real-time Announcements
- Automatic updates when announcements are created, edited, or deleted
- Real-time comment updates
- Instant pinning/unpinning notifications

### User Tagging
- @ mention functionality in comments
- Automatic user suggestion dropdown
- Mention highlighting in rendered comments

### Enhanced UX
- Optimistic UI updates
- Real-time collaboration
- Live comment threads

## File Structure
```
lib/
├── firebase/
│   ├── config.ts          # Firebase configuration
│   └── announcements.ts   # Firebase announcement service
components/
├── classes/
│   └── announcements/
│       ├── announcement-manager.tsx
│       ├── announcement-card.tsx
│       ├── comment-section.tsx
│       ├── user-mention.tsx
│       └── new-announcement-form.tsx
```

## Optional: Real-time Integration
To enable real-time updates, you can optionally modify the AnnouncementManager to use Firebase listeners instead of API polling:

```typescript
// In AnnouncementManager component
import { FirebaseAnnouncementService } from '@/lib/firebase/announcements';

// Replace loadAnnouncements with:
useEffect(() => {
  if (classroomId) {
    const unsubscribe = FirebaseAnnouncementService.subscribeToAnnouncements(
      classroomId,
      setAnnouncements
    );
    return unsubscribe;
  }
}, [classroomId]);
```

## Troubleshooting

### Common Issues
1. **"Firebase config not found"**: Ensure all environment variables are set correctly
2. **"Permission denied"**: Check Firestore security rules
3. **"Real-time updates not working"**: Verify Firebase configuration and network connectivity

### Debug Mode
To enable Firebase debug mode, add to your component:
```typescript
import { connectFirestoreEmulator } from 'firebase/firestore';

// For development only
if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(db, 'localhost', 8080);
}
```

## Production Considerations
1. Update security rules for production
2. Set up Firebase indexes for better performance
3. Configure backup and monitoring
4. Set up proper error logging 