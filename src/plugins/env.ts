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
 * - In production, uses Railway's environment variables
 * - In development, loads from .env file
 */

import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import fastifyEnv from '@fastify/env';

const envPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(fastifyEnv as any, {
    schema: {
      type: 'object',
      required: ['OPENAI_API_KEY', 'PORT'],
      properties: {
        NODE_ENV: {
          type: 'string',
          default: 'development'
        },
        PORT: {
          type: 'string',
          default: '3000'
        },
        OPENAI_API_KEY: {
          type: 'string'
        },
        API_URL: {
          type: 'string',
          default: 'http://localhost:3000'
        },
        // Instagram config
        INSTAGRAM_PAGE_ACCESS_TOKEN: {
          type: 'string'
        },
        INSTAGRAM_APP_ID: {
          type: 'string'
        },
        INSTAGRAM_API_VERSION: {
          type: 'string',
          default: 'v18.0'
        },
        INSTAGRAM_BASE_URL: {
          type: 'string',
          default: 'https://graph.facebook.com'
        },
        // Reddit config
        REDDIT_CLIENT_ID: {
          type: 'string'
        },
        REDDIT_CLIENT_SECRET: {
          type: 'string'
        },
        REDDIT_USERNAME: {
          type: 'string'
        },
        REDDIT_PASSWORD: {
          type: 'string'
        },
        REDDIT_USER_AGENT: {
          type: 'string',
          default: 'SaveMeAClickBot/1.0.0'
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