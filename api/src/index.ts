import Fastify from 'fastify';
import { summarizeRoute } from './routes/summarize.js';
import envPlugin from './plugins/env.js';
import cors from '@fastify/cors';

const server = Fastify({
  logger: {
    level: 'info',
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },
  }
});

// Register environment plugin first
await server.register(envPlugin as any);

// Register CORS
await server.register(cors, {
  origin: true, // Allow all origins in development, use CORS_ORIGIN in production
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflight: true,
  preflightContinue: false
});

// Register routes
server.register(summarizeRoute);

// Health check route
server.get('/health', async () => {
  return { status: 'ok' };
});

// Only start the server if we're not in a serverless environment
if (process.env.NODE_ENV !== 'production') {
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
}

export default server; 