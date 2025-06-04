import '@fastify/env';

declare module 'fastify' {
  interface FastifyInstance {
    config: {
      NODE_ENV: string;
      PORT: string;
      OPENAI_API_KEY: string;
      API_URL?: string;
      // Instagram config
      INSTAGRAM_PAGE_ACCESS_TOKEN?: string;
      INSTAGRAM_APP_ID?: string;
      INSTAGRAM_API_VERSION?: string;
      INSTAGRAM_BASE_URL?: string;
      // Reddit config
      REDDIT_CLIENT_ID?: string;
      REDDIT_CLIENT_SECRET?: string;
      REDDIT_USERNAME?: string;
      REDDIT_PASSWORD?: string;
      REDDIT_USER_AGENT?: string;
    }
  }
} 