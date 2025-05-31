import Fastify from 'fastify';
import dotenv from 'dotenv';
import { summarizeRoute } from './routes/summarize.js';

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
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start(); 