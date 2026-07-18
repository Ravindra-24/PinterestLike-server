import admin from 'firebase-admin';
import { app } from './app.js';

// Initialize Firebase Admin
admin.initializeApp();

// Export all Firebase Functions
export { expressApi } from './functions/express-api.js';
export { updateEngagementScores } from './functions/engagement-score.js';



// Here you can add more function exports as needed, for example:
// export { onUserCreated } from './functions/auth-triggers.js';
// export { processImage } from './functions/storage-triggers.js';
// export { scheduledTask } from './functions/scheduled-tasks.js';
