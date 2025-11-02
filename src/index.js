import admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export all Firebase Functions
export { expressApi } from './functions/express-api.js';

// Here you can add more function exports as needed, for example:
// export { onUserCreated } from './functions/auth-triggers.js';
// export { processImage } from './functions/storage-triggers.js';
// export { scheduledTask } from './functions/scheduled-tasks.js';