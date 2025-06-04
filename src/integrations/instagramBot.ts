import axios from 'axios';
import { FastifyInstance } from 'fastify';

interface SummarizeResponse {
  title: string;
  assessment: string;
  summary: string;
  url: string;
}

/**
 * Instagram Bot Integration
 * Monitors Instagram for mentions and summarizes articles
 */

export class InstagramBot {
  private config: FastifyInstance['config'];
  private apiUrl: string;
  private pageAccessToken: string;
  private processedMentions: Set<string>;

  constructor(config: FastifyInstance['config']) {
    if (!config.INSTAGRAM_PAGE_ACCESS_TOKEN) {
      throw new Error('Missing required Instagram credentials');
    }
    this.config = config;
    this.pageAccessToken = config.INSTAGRAM_PAGE_ACCESS_TOKEN;
    const { INSTAGRAM_BASE_URL, INSTAGRAM_API_VERSION } = this.config;
    this.apiUrl = `${INSTAGRAM_BASE_URL}/${INSTAGRAM_API_VERSION}`;
    this.processedMentions = new Set();
  }

  /**
   * Extract URL from text using a simple regex
   */
  private extractUrl(text: string): string | null {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
  }

  private formatContent(response: SummarizeResponse): string {
    return `Here's a summary of the article:\n\n${response.assessment}\n\n${response.summary}\n\nOriginal Article: ${response.url}\n\n---\n\nI'm a bot that summarizes articles and detects clickbait.`;
  }

  private async getMediaCaption(mediaId: string): Promise<string> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/${mediaId}`,
        {
          params: {
            fields: 'caption',
            access_token: this.pageAccessToken
          }
        }
      );
      return response.data.caption || '';
    } catch (error) {
      console.error('Error fetching media caption:', error);
      return '';
    }
  }

  private async getParentComment(commentId: string): Promise<string> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/${commentId}`,
        {
          params: {
            fields: 'parent_id,text',
            access_token: this.pageAccessToken
          }
        }
      );
      return response.data.text || '';
    } catch (error) {
      console.error('Error fetching parent comment:', error);
      return '';
    }
  }

  private async findUrlInContext(mention: any): Promise<string | null> {
    // First check the mention comment itself
    const mentionUrl = this.extractUrl(mention.text);
    if (mentionUrl) return mentionUrl;

    try {
      // If the mention is on a media post, check the caption
      if (mention.media_id) {
        const caption = await this.getMediaCaption(mention.media_id);
        const captionUrl = this.extractUrl(caption);
        if (captionUrl) return captionUrl;
      }

      // Check parent comment if it exists
      if (mention.parent_id) {
        const parentText = await this.getParentComment(mention.parent_id);
        const parentUrl = this.extractUrl(parentText);
        if (parentUrl) return parentUrl;
      }

      return null;
    } catch (error) {
      console.error('Error finding URL in context:', error);
      return null;
    }
  }

  /**
   * Get recent mentions and comments
   */
  private async getRecentMentions(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/me/mentions`,
        {
          params: {
            access_token: this.pageAccessToken,
            fields: 'id,text,username,media_id,parent_id'
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching mentions:', error);
      return [];
    }
  }

  /**
   * Reply to a comment
   */
  private async replyToComment(commentId: string, message: string): Promise<void> {
    try {
      await axios.post(
        `${this.apiUrl}/${commentId}/replies`,
        {
          message,
          access_token: this.pageAccessToken
        }
      );
    } catch (error) {
      console.error('Error replying to comment:', error);
    }
  }

  /**
   * Process a mention and reply with article summary
   */
  private async processMention(mention: any): Promise<void> {
    if (this.processedMentions.has(mention.id)) {
      return;
    }

    const url = await this.findUrlInContext(mention);
    if (!url) {
      await this.replyToComment(
        mention.id,
        'I couldn\'t find any article URL in this post or its comments. Please include a URL in your comment or make sure the post contains a link to an article.'
      );
      return;
    }

    try {
      const apiUrl = this.config.API_URL || 'http://localhost:3000';
      const response = await axios.post(`${apiUrl}/summarize`, { url });
      const summary = this.formatContent(response.data);
      
      await this.replyToComment(mention.id, summary);
      this.processedMentions.add(mention.id);
    } catch (error) {
      console.error('Error processing mention:', error);
      await this.replyToComment(
        mention.id,
        'Sorry, I encountered an error while processing that article. Please try again later.'
      );
    }
  }

  /**
   * Start polling for mentions
   */
  public async startPolling(intervalMs: number = 60000): Promise<void> {
    console.log('Starting Instagram bot polling...');
    
    const poll = async () => {
      try {
        const mentions = await this.getRecentMentions();
        for (const mention of mentions) {
          await this.processMention(mention);
        }
      } catch (error) {
        console.error('Error in polling cycle:', error);
      }
    };

    // Initial poll
    await poll();

    // Set up interval
    setInterval(poll, intervalMs);
  }
} 