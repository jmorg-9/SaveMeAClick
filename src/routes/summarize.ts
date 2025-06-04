import { FastifyInstance } from 'fastify';
import { extract } from '@extractus/article-extractor';
import OpenAI from 'openai';

// Types
interface SummarizeRequest {
  url: string;
}

interface SummarizeResponse {
  title: string;
  assessment: string;
  summary: string;
  url: string;
}

// Route handler
export const summarizeRoute = async (fastify: FastifyInstance) => {
  // Initialize OpenAI client with config
  const openai = new OpenAI({
    apiKey: fastify.config.OPENAI_API_KEY
  });

  fastify.post<{ Body: SummarizeRequest; Reply: SummarizeResponse }>(
    '/summarize',
    {
      schema: {
        body: {
          type: 'object',
          required: ['url'],
          properties: {
            url: { type: 'string', format: 'uri' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              assessment: { type: 'string' },
              summary: { type: 'string' },
              url: { type: 'string' }
            }
          }
        }
      }
    },
    async (request, reply) => {
      const { url } = request.body;

      try {
        fastify.log.info({ url }, 'Attempting to extract article content');
        
        // Extract article content
        const article = await extract(url);
        
        if (!article) {
          fastify.log.error({ url }, 'Article extraction returned null');
          throw new Error('Failed to extract article content - article is null');
        }
        
        if (!article.content) {
          fastify.log.error({ url, title: article.title }, 'Article has no content');
          throw new Error('Failed to extract article content - no content found');
        }
        
        if (!article.title) {
          fastify.log.error({ url }, 'Article has no title');
          throw new Error('Failed to extract article content - no title found');
        }

        fastify.log.info({ 
          url, 
          title: article.title,
          contentLength: article.content.length 
        }, 'Successfully extracted article');

        // Get summary and clickbait assessment from OpenAI
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant that analyzes articles for clickbait and provides concise summaries.
                For clickbait assessment, use these emojis:
                - 🚫 for clickbait/misleading titles
                - ✅ for accurate/truthful titles
                - ⚠️ for sensationalized titles
                - ❓ for ambiguous titles

                Format your response EXACTLY like this:
                Title: [Article Title]
                [emoji] [one sentence assessment]
                Summary: [exactly 150 characters summary]`
            },
            {
              role: "user",
              content: `Analyze this article:
                Title: ${article.title}
                Content: ${article.content}
                URL: ${url}`
            }
          ]
        });

        const response = completion.choices[0].message.content;
        if (!response) {
          fastify.log.error('OpenAI returned empty response');
          throw new Error('Failed to get response from OpenAI');
        }

        fastify.log.info({ response }, 'Raw OpenAI response');

        // Parse the response into structured data
        const lines = response.split('\n').map(line => line.trim()).filter(line => line);
        const titleLine = lines.find(line => line.startsWith('Title:'));
        const assessmentLine = lines.find(line => line.match(/[🚫✅⚠️❓]/));
        const summaryLine = lines.find(line => line.startsWith('Summary:'));

        if (!titleLine || !assessmentLine || !summaryLine) {
          fastify.log.error({ titleLine, assessmentLine, summaryLine }, 'Failed to parse OpenAI response');
          throw new Error('Invalid response format from OpenAI');
        }

        return {
          title: titleLine.replace('Title:', '').trim(),
          assessment: assessmentLine.trim(),
          summary: summaryLine.replace('Summary:', '').trim(),
          url: url
        };
      } catch (error) {
        fastify.log.error({ 
          error: error instanceof Error ? error.message : 'Unknown error',
          url 
        }, 'Error in summarize route');
        throw error;
      }
    }
  );
}; 