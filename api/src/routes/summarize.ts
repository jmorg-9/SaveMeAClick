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
  keyPoints: string[];
  url: string;
  qualityScore: number;
  timeSaved: number;
  processingTime: number;
  clickbaitScore: number;
  contentQuality: {
    readability: number;
    objectivity: number;
    depth: number;
  };
}

// Route handler
export const summarizeRoute = async (fastify: FastifyInstance) => {
  // Initialize OpenAI client with config
  const openai = new OpenAI({
    apiKey: fastify.config.OPENAI_API_KEY,
    timeout: 90000, // 90 second timeout for OpenAI requests
    maxRetries: 3
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
              keyPoints: { type: 'array', items: { type: 'string' } },
              url: { type: 'string' },
              qualityScore: { type: 'number' },
              timeSaved: { type: 'number' },
              processingTime: { type: 'number' },
              clickbaitScore: { type: 'number' },
              contentQuality: {
                type: 'object',
                properties: {
                  readability: { type: 'number' },
                  objectivity: { type: 'number' },
                  depth: { type: 'number' }
                }
              }
            }
          }
        }
      }
    },
    async (request, reply) => {
      const startTime = Date.now();
      const { url } = request.body;

      try {
        fastify.log.info({ url }, 'Starting article analysis');
        
        // Extract article content
        const extractStartTime = Date.now();
        fastify.log.info('Starting article extraction...');
        const article = await extract(url);
        const extractTime = Date.now() - extractStartTime;
        fastify.log.info({ extractTime }, 'Article extraction completed');
        
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
          contentLength: article.content.length,
          extractTime 
        }, 'Successfully extracted article');

        // Get summary and analysis from OpenAI using streaming
        const openaiStartTime = Date.now();
        fastify.log.info('Starting OpenAI analysis with streaming...');
        
        let fullResponse = '';
        const stream = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are a helpful assistant that analyzes articles for clickbait and provides detailed summaries.
                For clickbait assessment, use these emojis:
                - 🚫 for clickbait/misleading titles
                - ✅ for accurate/truthful titles
                - ⚠️ for sensationalized titles
                - ❓ for ambiguous titles

                Format your response EXACTLY like this:
                Title: [Article Title]
                [emoji] [one sentence assessment]
                Summary: [2-3 paragraph detailed summary of the article's main points and arguments]
                Key Points:
                - [First key point]
                - [Second key point]
                - [Third key point]
                - [Fourth key point]
                Quality Metrics:
                - Clickbait Score: [0-100]
                - Readability: [0-100]
                - Objectivity: [0-100]
                - Content Depth: [0-100]
                - Estimated Reading Time: [minutes]`
            },
            {
              role: "user",
              content: `Analyze this article:
                Title: ${article.title}
                Content: ${article.content}
                URL: ${url}`
            }
          ],
          stream: true,
          temperature: 0.7,
          max_tokens: 2000
        });

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;
          fastify.log.debug({ chunk: content }, 'Received chunk from OpenAI');
        }

        const openaiTime = Date.now() - openaiStartTime;
        fastify.log.info({ openaiTime }, 'OpenAI streaming completed');

        if (!fullResponse) {
          fastify.log.error('OpenAI returned empty response');
          throw new Error('Failed to get response from OpenAI');
        }

        // Parse the response into structured data
        const parseStartTime = Date.now();
        fastify.log.info('Starting response parsing...');
        const lines = fullResponse.split('\n').map(line => line.trim()).filter(line => line);
        const titleLine = lines.find(line => line.startsWith('Title:'));
        const assessmentLine = lines.find(line => line.match(/[🚫✅⚠️❓]/));
        const summaryStartIndex = lines.findIndex(line => line.startsWith('Summary:'));
        const keyPointsStartIndex = lines.findIndex(line => line.startsWith('Key Points:'));
        const qualityMetricsStartIndex = lines.findIndex(line => line.startsWith('Quality Metrics:'));
        
        if (!titleLine || !assessmentLine || summaryStartIndex === -1 || keyPointsStartIndex === -1 || qualityMetricsStartIndex === -1) {
          fastify.log.error({ titleLine, assessmentLine, summaryStartIndex, keyPointsStartIndex, qualityMetricsStartIndex }, 'Failed to parse OpenAI response');
          throw new Error('Invalid response format from OpenAI');
        }

        const summary = lines
          .slice(summaryStartIndex + 1, keyPointsStartIndex)
          .join('\n')
          .trim();

        const keyPoints = lines
          .slice(keyPointsStartIndex + 1, qualityMetricsStartIndex)
          .filter(line => line.startsWith('-'))
          .map(line => line.replace('-', '').trim());

        // Parse quality metrics
        const qualityMetrics = lines
          .slice(qualityMetricsStartIndex + 1)
          .filter(line => line.startsWith('-'))
          .reduce((acc, line) => {
            const [key, value] = line.replace('-', '').split(':').map(s => s.trim());
            const numValue = parseInt(value);
            if (!isNaN(numValue)) {
              acc[key] = numValue;
            }
            return acc;
          }, {} as Record<string, number>);

        const parseTime = Date.now() - parseStartTime;
        fastify.log.info({ parseTime }, 'Response parsing completed');

        const processingTime = (Date.now() - startTime) / 1000; // in seconds
        const estimatedReadingTime = qualityMetrics['Estimated Reading Time'] || 5; // default to 5 minutes if not provided
        const timeSaved = Math.max(0, estimatedReadingTime - (processingTime / 60)); // in minutes

        // Calculate overall quality score
        const qualityScore = Math.round(
          (qualityMetrics['Readability'] || 0) * 0.3 +
          (qualityMetrics['Objectivity'] || 0) * 0.3 +
          (qualityMetrics['Content Depth'] || 0) * 0.4
        );

        fastify.log.info({ 
          totalTime: processingTime,
          extractTime,
          openaiTime,
          parseTime
        }, 'Request completed');

        return {
          title: titleLine.replace('Title:', '').trim(),
          assessment: assessmentLine.trim(),
          summary: summary,
          keyPoints: keyPoints,
          url: url,
          qualityScore: qualityScore,
          timeSaved: timeSaved,
          processingTime: processingTime,
          clickbaitScore: qualityMetrics['Clickbait Score'] || 0,
          contentQuality: {
            readability: qualityMetrics['Readability'] || 0,
            objectivity: qualityMetrics['Objectivity'] || 0,
            depth: qualityMetrics['Content Depth'] || 0
          }
        };
      } catch (error) {
        fastify.log.error({ 
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          url,
          totalTime: (Date.now() - startTime) / 1000
        }, 'Error in summarize route');
        throw error;
      }
    }
  );
}; 