/**
 * Environment Configuration Plugin
 * 
 * This plugin manages environment variables for the SaveMeAClick application using @fastify/env.
 * It provides type-safe access to environment variables and validates required configurations.
 * 
 * Key Features:
 * - Validates required environment variables (OPENAI_API_KEY, PORT)
 * - Provides default values for optional configurations
 * - Handles different environments (development/production)
 * - Centralizes all environment variable definitions
 * 
 * Usage:
 * - Access config values via fastify.config (e.g., fastify.config.OPENAI_API_KEY)
 * - All environment variables are typed and validated at startup
 * - In production, uses Vercel's environment variables
 * - In development, loads from .env file
 */

import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import fastifyEnv from '@fastify/env';

const envPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyEnv as any, {
    schema: {
      type: 'object',
      required: ['OPENAI_API_KEY'],
      properties: {
        NODE_ENV: {
          type: 'string',
          default: 'development'
        },
        PORT: {
          type: 'string',
          default: process.env.PORT || '3000' // Use Vercel's PORT if available
        },
        VERCEL_URL: {
          type: 'string',
          default: process.env.VERCEL_URL || 'localhost:3000'
        },
        OPENAI_API_KEY: {
          type: 'string'
        },
        CORS_ORIGIN: {
          type: 'string',
          default: process.env.NODE_ENV === 'production' ? undefined : '*'
        },
        API_URL: {
          type: 'string',
          default: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
        }
      }
    },
    dotenv: {
      path: process.env.NODE_ENV === 'production' ? undefined : '.env'
    },
    confKey: 'config',
    data: process.env
  });
};

export default fp(envPlugin, { name: 'env' }); 