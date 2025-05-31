import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface InstagramConfig {
  pageAccessToken: string;
  appId: string;
  apiVersion: string;
  baseUrl: string;
}

interface SummarizeResponse {
  title: string;
  summary: string;
  isClickbait: boolean;
  clickbaitAssessment: string;
}

/**
 * Instagram Bot Integration
 * 
 * Setup Instructions:
 * 1. Create a Facebook Developer account at https://developers.facebook.com
 * 2. Create a new app and add Instagram Basic Display API
 * 3. Convert your Instagram account to a Professional account
 * 4. Connect your Instagram account to your Facebook Page
 * 5. Generate a Page Access Token with the following permissions:
 *    - instagram_basic
 *    - instagram_manage_comments
 *    - instagram_manage_messages
 *    - pages_show_list
 *    - pages_read_engagement
 * 6. Add the following to your .env file:
 *    INSTAGRAM_PAGE_ACCESS_TOKEN=your_token_here
 *    INSTAGRAM_APP_ID=your_app_id_here
 */

export class InstagramBot {
  private config: InstagramConfig;
  private apiUrl: string;

  constructor() {
    this.config = {
      pageAccessToken: process.env.INSTAGRAM_PAGE_ACCESS_TOKEN || '',
      appId: process.env.INSTAGRAM_APP_ID || '',
      apiVersion: 'v18.0',
      baseUrl: 'https://graph.facebook.com'
    };

    this.apiUrl = `${this.config.baseUrl}/${this.config.apiVersion}`;

    if (!this.config.pageAccessToken || !this.config.appId) {
      throw new Error('Instagram configuration missing. Please check your .env file.');
    }
  }

  /**
   * Extract URL from text using a simple regex
   */
  private extractUrl(text: string): string | null {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const match = text.match(urlRegex);
    return match ? match[0] : null;
  }

  /**
   * Format a short reply with the summary and clickbait status
   */
  private formatReply(response: SummarizeResponse): string {
    const clickbaitStatus = response.isClickbait ? '⚠️ Clickbait detected!' : '✅ Title appears accurate';
    return `${response.summary}\n\n${clickbaitStatus}\n\n${response.clickbaitAssessment}`;
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
            access_token: this.config.pageAccessToken,
            fields: 'id,text,username,media_id'
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
          access_token: this.config.pageAccessToken
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
    const url = this.extractUrl(mention.text);
    if (!url) return;

    try {
      // Call our summarize API
      const response = await axios.post('http://localhost:3000/summarize', { url });
      const summary = this.formatReply(response.data);
      
      // Reply to the comment
      await this.replyToComment(mention.id, summary);
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