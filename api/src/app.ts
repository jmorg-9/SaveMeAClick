import Fastify from 'fastify';
import cors from '@fastify/cors';
import env from '@fastify/env';
import { summarizeRoute } from './routes/summarize.js';

const envSchema = {
  type: 'object',
  required: ['OPENAI_API_KEY'],
  properties: {
    OPENAI_API_KEY: {
      type: 'string'
    }
  }
};

export async function build() {
  const app = Fastify({
    logger: true
  });

  await app.register(env, {
    schema: envSchema,
    dotenv: true
  });

  await app.register(cors, {
    origin: true
  });

  await app.register(summarizeRoute);

  return app;
} 