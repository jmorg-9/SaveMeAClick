import { FastifyInstance } from 'fastify';
import { extract } from '@extractus/article-extractor';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Types
interface SummarizeRequest {
  url: string;
}

interface SummarizeResponse {
  title: string;
  summary: string;
  isClickbait: boolean;
  clickbaitAssessment: string;
}

// Route handler
export const summarizeRoute = async (fastify: FastifyInstance) => {
  fastify.post<{ Body: SummarizeRequest; Reply: SummarizeResponse }>(
    '/summarize',
    async (request, reply) => {
      const { url } = request.body;

      try {
        // Extract article content
        const article = await extract(url);
        
        if (!article || !article.content || !article.title) {
          throw new Error('Failed to extract article content');
        }

        // Prepare content for OpenAI
        const content = `
          Title: ${article.title}
          Content: ${article.content}
        `;

        // Get summary and clickbait assessment from OpenAI
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that summarizes articles and assesses if their titles are clickbait. Provide a concise summary in plain language and evaluate if the title is misleading or clickbait."
            },
            {
              role: "user",
              content: `Please analyze this article and provide:
                1. A concise summary in plain language
                2. An assessment of whether the title is clickbait or misleading
                
                Article:
                ${content}`
            }
          ]
        });

        const response = completion.choices[0].message.content;
        if (!response) {
          throw new Error('Failed to get response from OpenAI');
        }

        // Parse the response to separate summary and clickbait assessment
        const [summary, clickbaitAssessment] = response.split('\n\n');
        const isClickbait = clickbaitAssessment.toLowerCase().includes('clickbait') || 
                          clickbaitAssessment.toLowerCase().includes('misleading');

        return {
          title: article.title,
          summary: summary.replace('Summary:', '').trim(),
          isClickbait,
          clickbaitAssessment: clickbaitAssessment.replace('Clickbait Assessment:', '').trim()
        };
      } catch (error) {
        fastify.log.error(error);
        throw error;
      }
    }
  );
}; 