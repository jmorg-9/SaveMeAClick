import { FastifyInstance } from 'fastify';
import OpenAI from 'openai';

interface TestResponse {
  message: string;
  processingTime: number;
  model: string;
  chunks: number;
}

export const testRoute = async (fastify: FastifyInstance) => {
  // Initialize OpenAI client with config
  const openai = new OpenAI({
    apiKey: fastify.config.OPENAI_API_KEY,
    timeout: 90000, // 90 second timeout for OpenAI requests
    maxRetries: 3
  });

  fastify.get<{ Reply: TestResponse }>(
    '/test',
    {
      schema: {
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              processingTime: { type: 'number' },
              model: { type: 'string' },
              chunks: { type: 'number' }
            }
          }
        }
      }
    },
    async (request, reply) => {
      const startTime = Date.now();

      try {
        fastify.log.info('Starting simple OpenAI test request with streaming');
        
        let fullResponse = '';
        let chunkCount = 0;
        
        const stream = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant. Respond with a single sentence."
            },
            {
              role: "user",
              content: "Say hello and tell me the current time."
            }
          ],
          stream: true,
          max_tokens: 50
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;
          chunkCount++;
          fastify.log.debug({ 
            chunk: content,
            chunkNumber: chunkCount 
          }, 'Received chunk from OpenAI');
        }

        const processingTime = (Date.now() - startTime) / 1000; // in seconds
        fastify.log.info({ 
          processingTime,
          chunkCount,
          responseLength: fullResponse.length 
        }, 'Test request completed');

        return {
          message: fullResponse || 'No response from OpenAI',
          processingTime,
          model: "gpt-4o",
          chunks: chunkCount
        };
      } catch (error) {
        fastify.log.error({ 
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          processingTime: (Date.now() - startTime) / 1000
        }, 'Error in test route');
        throw error;
      }
    }
  );
}; 