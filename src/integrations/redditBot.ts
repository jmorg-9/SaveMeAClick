import Snoowrap from 'snoowrap';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface RedditConfig {
  userAgent: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
}

interface SummarizeResponse {
  title: string;
  summary: string;
  isClickbait: boolean;
  clickbaitAssessment: string;
}

/**
 * Reddit Bot Integration
 * 
 * Setup Instructions:
 * 1. Create a Reddit account for your bot
 * 2. Go to https://www.reddit.com/prefs/apps
 * 3. Click "create another app..."
 * 4. Fill in the details:
 *    - Name: SaveMeAClickBot
 *    - Type: script
 *    - Description: Bot that summarizes articles and detects clickbait
 *    - About URL: (optional)
 *    - Redirect URI: http://localhost:8080
 * 5. Note down the client ID (under the app name) and client secret
 * 6. Add the following to your .env file:
 *    REDDIT_USER_AGENT=SaveMeAClickBot/1.0.0
 *    REDDIT_CLIENT_ID=your_client_id
 *    REDDIT_CLIENT_SECRET=your_client_secret
 *    REDDIT_USERNAME=your_bot_username
 *    REDDIT_PASSWORD=your_bot_password
 */

export class RedditBot {
  private client: Snoowrap;
  private processedComments: Set<string>;

  constructor() {
    const config: RedditConfig = {
      userAgent: process.env.REDDIT_USER_AGENT || 'SaveMeAClickBot/1.0.0',
      clientId: process.env.REDDIT_CLIENT_ID || '',
      clientSecret: process.env.REDDIT_CLIENT_SECRET || '',
      username: process.env.REDDIT_USERNAME || '',
      password: process.env.REDDIT_PASSWORD || ''
    };

    if (!config.clientId || !config.clientSecret || !config.username || !config.password) {
      throw new Error('Reddit configuration missing. Please check your .env file.');
    }

    this.client = new Snoowrap({
      userAgent: config.userAgent,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      username: config.username,
      password: config.password
    });

    this.processedComments = new Set();
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
   * Format a reply with the summary and clickbait status
   */
  private formatReply(response: SummarizeResponse): string {
    const clickbaitStatus = response.isClickbait ? '⚠️ Clickbait detected!' : '✅ Title appears accurate';
    return `Here's a summary of the article:\n\n${response.summary}\n\n${clickbaitStatus}\n\n${response.clickbaitAssessment}\n\n---\n\n^(I'm a bot that summarizes articles and detects clickbait. | [Source](https://github.com/yourusername/save-me-a-click))`;
  }

  /**
   * Process a comment and reply with article summary
   */
  private async processComment(comment: Snoowrap.Comment): Promise<void> {
    // Skip if we've already processed this comment
    if (this.processedComments.has(comment.id)) {
      return;
    }

    const url = this.extractUrl(comment.body);
    if (!url) return;

    try {
      // Call our summarize API
      const response = await axios.post('http://localhost:3000/summarize', { url });
      const summary = this.formatReply(response.data);
      
      // Reply to the comment
      await comment.reply(summary);
      
      // Mark as processed
      this.processedComments.add(comment.id);
    } catch (error) {
      console.error('Error processing comment:', error);
      try {
        await comment.reply('Sorry, I encountered an error while processing that article. Please try again later.');
      } catch (replyError) {
        console.error('Error sending error reply:', replyError);
      }
    }
  }

  /**
   * Start monitoring for mentions
   */
  public async startMonitoring(): Promise<void> {
    console.log('Starting Reddit bot monitoring...');

    // Monitor mentions
    this.client.getInbox().stream().on('item', async (item) => {
      if (item instanceof Snoowrap.Comment) {
        // Check if the comment mentions our bot
        if (item.body.toLowerCase().includes('u/savemeaclickbot')) {
          await this.processComment(item);
        }
      }
    });

    // Monitor specific subreddits (optional)
    const subreddits = ['all']; // Add specific subreddits to monitor
    for (const subreddit of subreddits) {
      this.client.getSubreddit(subreddit).getNewComments().stream().on('item', async (comment) => {
        if (comment.body.toLowerCase().includes('u/savemeaclickbot')) {
          await this.processComment(comment);
        }
      });
    }
  }
} 