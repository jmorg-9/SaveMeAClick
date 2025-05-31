import Fastify from 'fastify';
import dotenv from 'dotenv';
import { summarizeRoute } from './routes/summarize.js';
import { InstagramBot } from './integrations/instagramBot.js';
import { RedditBot } from './integrations/redditBot.js';

// Load environment variables
dotenv.config();

const server = Fastify({
  logger: true
});

// Register routes
server.register(summarizeRoute);

// Health check route
server.get('/health', async () => {
  return { status: 'ok' };
});

// Start server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    await server.listen({ port, host: '0.0.0.0' });

    // Initialize Instagram bot if credentials are available
    if (process.env.INSTAGRAM_PAGE_ACCESS_TOKEN && process.env.INSTAGRAM_APP_ID) {
      const instagramBot = new InstagramBot();
      await instagramBot.startPolling();
      server.log.info('Instagram bot started');
    } else {
      server.log.warn('Instagram bot not started - missing credentials');
    }

    // Initialize Reddit bot if credentials are available
    if (process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET && 
        process.env.REDDIT_USERNAME && process.env.REDDIT_PASSWORD) {
      const redditBot = new RedditBot();
      await redditBot.startMonitoring();
      server.log.info('Reddit bot started');
    } else {
      server.log.warn('Reddit bot not started - missing credentials');
    }
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start(); 