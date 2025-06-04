import { FastifyInstance } from 'fastify';
import snoowrap from 'snoowrap';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

interface SummarizeResponse {
  title: string;
  assessment: string;
  summary: string;
  url: string;
}

/**
 * Reddit Bot Integration
 * Monitors Reddit for mentions and summarizes articles
 */

export class RedditBot {
  private config: FastifyInstance['config'];
  private reddit: snoowrap;
  private processedComments: Set<string>;
  private readonly BOT_USERNAME = 'savemeaclickbot';

  constructor(config: FastifyInstance['config']) {
    if (!config.REDDIT_CLIENT_ID || !config.REDDIT_CLIENT_SECRET || 
        !config.REDDIT_USERNAME || !config.REDDIT_PASSWORD) {
      throw new Error('Missing required Reddit credentials');
    }
    this.config = config;
    this.reddit = new snoowrap({
      userAgent: 'SaveMeAClick Bot v1.0',
      clientId: config.REDDIT_CLIENT_ID,
      clientSecret: config.REDDIT_CLIENT_SECRET,
      username: config.REDDIT_USERNAME,
      password: config.REDDIT_PASSWORD
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
  private formatContent(response: SummarizeResponse): string {
    return `Here's a summary of the article:\n\n${response.assessment}\n\n${response.summary}\n\n[Original Article](${response.url})\n\n---\n\n^(I'm a bot that summarizes articles and detects clickbait.)`;
  }

  private isMention(text: string): boolean {
    const mentionRegex = new RegExp(`u/${this.BOT_USERNAME}|/u/${this.BOT_USERNAME}`, 'i');
    return mentionRegex.test(text);
  }

  private async findUrlInContext(comment: snoowrap.Comment): Promise<string | null> {
    // First check the comment itself
    const commentUrl = this.extractUrl(comment.body);
    if (commentUrl) return commentUrl;

    try {
      // Get the submission (post) that this comment belongs to
      const submission = await (comment as any).submission.fetch();
      
      // Check the post title and selftext
      const postUrl = this.extractUrl(submission.title) || this.extractUrl(submission.selftext);
      if (postUrl) return postUrl;

      // If it's a link post, return the URL
      if (submission.url && submission.url.startsWith('http')) {
        return submission.url;
      }

      // If no URL found, check parent comments
      if (comment.parent_id) {
        const parentComment = await (comment as any).parent.fetch();
        const parentUrl = this.extractUrl(parentComment.body);
        if (parentUrl) return parentUrl;
      }

      return null;
    } catch (error) {
      console.error('Error finding URL in context:', error);
      return null;
    }
  }

  /**
   * Process a comment and reply with article summary
   */
  private async processComment(comment: snoowrap.Comment): Promise<void> {
    if (this.processedComments.has(comment.id)) {
      return;
    }

    const url = await this.findUrlInContext(comment);
    if (!url) {
      await (comment.reply('I couldn\'t find any article URL in this post or its comments. Please include a URL in your comment or make sure the post contains a link to an article.') as unknown as Promise<void>);
      return;
    }

    try {
      const apiUrl = this.config.API_URL || 'http://localhost:3000';
      const response = await axios.post(`${apiUrl}/summarize`, { url });
      const summary = this.formatContent(response.data);
      
      await (comment.reply(summary) as unknown as Promise<void>);
      this.processedComments.add(comment.id);
    } catch (error) {
      console.error('Error processing comment:', error);
      try {
        await (comment.reply('Sorry, I encountered an error while processing that article. Please try again later.') as unknown as Promise<void>);
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

    // Monitor mentions in inbox
    (await this.reddit.getInbox() as any).stream().on('item', async (item: snoowrap.Comment | snoowrap.PrivateMessage) => {
      if (item instanceof snoowrap.Comment && this.isMention(item.body)) {
        await this.processComment(item);
      }
    });

    // Monitor mentions in comments
    const subreddits = ['all']; // Add specific subreddits to monitor
    for (const subreddit of subreddits) {
      (await this.reddit.getSubreddit(subreddit).getNewComments() as any).stream().on('item', async (comment: snoowrap.Comment) => {
        if (this.isMention(comment.body)) {
          await this.processComment(comment);
        }
      });
    }
  }

  async postToReddit(response: SummarizeResponse, subreddit: string): Promise<void> {
    try {
      const formattedContent = this.formatContent(response);
      
      await (this.reddit.getSubreddit(subreddit).submitSelfpost({
        title: response.title,
        text: formattedContent,
        subredditName: subreddit
      }) as unknown as Promise<void>);
    } catch (error) {
      console.error('Error posting to Reddit:', error);
      throw error;
    }
  }
} 