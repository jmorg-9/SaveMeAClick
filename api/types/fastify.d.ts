import '@fastify/env';

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      NODE_ENV: string;
      PORT: string;
      OPENAI_API_KEY: string;
      API_URL: string;
      CORS_ORIGIN?: string;
    };
  }
} 