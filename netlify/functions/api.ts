import serverless from 'serverless-http';
import app from '../../src/backend/app.ts';

export const handler = serverless(app);
