import { defineString, defineInt } from 'firebase-functions/params';
import { onRequest } from 'firebase-functions/v2/https';
import { app } from '../app.js';

// Export the Express API as a Firebase Function in Asia region (Mumbai)
export const expressApi = onRequest({
    region: 'asia-south1',
    timeoutSeconds: 540,
    memory: '512MiB',
    minInstances: 0
}, app);