import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock environment variables if not set
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'test-openai-key';
process.env.INSTAGRAM_PAGE_ACCESS_TOKEN = process.env.INSTAGRAM_PAGE_ACCESS_TOKEN || 'test-instagram-token';
process.env.INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID || 'test-instagram-app-id';
process.env.REDDIT_USER_AGENT = process.env.REDDIT_USER_AGENT || 'SaveMeAClickBot/1.0.0';
process.env.REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID || 'test-reddit-client-id';
process.env.REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET || 'test-reddit-client-secret';
process.env.REDDIT_USERNAME = process.env.REDDIT_USERNAME || 'test-reddit-username';
process.env.REDDIT_PASSWORD = process.env.REDDIT_PASSWORD || 'test-reddit-password'; 