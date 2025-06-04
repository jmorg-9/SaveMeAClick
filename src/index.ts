import Fastify from 'fastify';
import { summarizeRoute } from './routes/summarize.js';
import { InstagramBot } from './integrations/instagramBot.js';
import { RedditBot } from './integrations/redditBot.js';
import envPlugin from './plugins/env.js';

const server = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        colorize: true
      }
    },
    level: 'info'
  }
});

// Register environment plugin first
await server.register(envPlugin as any);

// Register routes
server.register(summarizeRoute);

// Health check route
server.get('/health', async () => {
  return { status: 'ok' };
});

// Start server
const start = async () => {
  try {
    const port = parseInt(server.config.PORT);
    await server.listen({ port, host: '0.0.0.0' });
    server.log.info(`Server is running on port ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start(); 