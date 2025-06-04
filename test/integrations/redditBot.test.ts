import { RedditBot } from '../../src/integrations/redditBot.js';
import axios from 'axios';
import Snoowrap from 'snoowrap';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock Snoowrap
jest.mock('snoowrap');

describe('RedditBot', () => {
  let bot: RedditBot;
  let mockComment: any;
  let mockConfig: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock config
    mockConfig = {
      REDDIT_CLIENT_ID: 'test-client-id',
      REDDIT_CLIENT_SECRET: 'test-client-secret',
      REDDIT_USERNAME: 'test-username',
      REDDIT_PASSWORD: 'test-password',
      API_URL: 'http://localhost:3000'
    };

    // Create bot instance
    bot = new RedditBot(mockConfig);

    // Mock comment
    mockComment = {
      id: 'test-comment-id',
      body: 'Check this out u/SaveMeAClickBot https://example.com/article',
      reply: jest.fn().mockResolvedValue(undefined),
      parent_id: 'test-parent-id',
      submission: {
        fetch: jest.fn().mockResolvedValue({
          title: 'Test Post',
          selftext: 'Test content',
          url: 'https://example.com/article'
        })
      },
      parent: {
        fetch: jest.fn().mockResolvedValue({
          body: 'Check this article https://example.com/article'
        })
      }
    };

    // Mock Snoowrap instance
    (Snoowrap as unknown as jest.Mock).mockImplementation(() => ({
      getInbox: () => ({
        stream: () => ({
          on: jest.fn()
        })
      }),
      getSubreddit: () => ({
        getNewComments: () => ({
          stream: () => ({
            on: jest.fn()
          })
        })
      })
    }));
  });

  describe('extractUrl', () => {
    it('should extract URL from text', () => {
      const text = 'Check this out https://example.com/article';
      const url = (bot as any).extractUrl(text);
      expect(url).toBe('https://example.com/article');
    });

    it('should return null when no URL is present', () => {
      const text = 'No URL here';
      const url = (bot as any).extractUrl(text);
      expect(url).toBeNull();
    });
  });

  describe('formatContent', () => {
    it('should format content with assessment and summary', () => {
      const response = {
        title: 'Test Article',
        assessment: 'This is clickbait',
        summary: 'Test summary',
        url: 'https://example.com/article'
      };

      const content = (bot as any).formatContent(response);
      expect(content).toContain('Here\'s a summary of the article:');
      expect(content).toContain('This is clickbait');
      expect(content).toContain('Test summary');
      expect(content).toContain('https://example.com/article');
    });
  });

  describe('findUrlInContext', () => {
    beforeEach(() => {
      // Reset any mocks before each test
      jest.clearAllMocks();
    });

    it('should find URL in comment text', async () => {
      const url = await (bot as any).findUrlInContext(mockComment);
      expect(url).toBe('https://example.com/article');
    });

    it('should find URL in submission', async () => {
      const commentWithoutUrl = {
        ...mockComment,
        body: 'No URL here',
        submission: {
          fetch: jest.fn().mockResolvedValue({
            title: 'Test Post',
            selftext: 'Test content',
            url: 'https://example.com/article'
          })
        }
      };

      const url = await (bot as any).findUrlInContext(commentWithoutUrl);
      expect(url).toBe('https://example.com/article');
    });

    it('should find URL in parent comment', async () => {
      const commentWithoutUrl = {
        ...mockComment,
        body: 'No URL here',
        submission: {
          fetch: jest.fn().mockResolvedValue({
            title: 'Test Post',
            selftext: 'Test content',
            url: '' // No valid URL in submission
          })
        },
        parent: {
          fetch: jest.fn().mockResolvedValue({
            body: 'Check this article https://example.com/article'
          })
        }
      };

      // Mock the extractUrl method to return null for the comment body
      jest.spyOn(bot as any, 'extractUrl').mockImplementation((text: unknown) => {
        if (typeof text !== 'string') return null;
        if (text === 'No URL here') return null;
        if (text.includes('https://example.com/article')) return 'https://example.com/article';
        return null;
      });

      const url = await (bot as any).findUrlInContext(commentWithoutUrl);
      expect(url).toBe('https://example.com/article');
    });

    it('should return null when no URL is found', async () => {
      const commentWithoutUrl = {
        ...mockComment,
        body: 'No URL here',
        submission: {
          fetch: jest.fn().mockResolvedValue({
            title: 'Test Post',
            selftext: 'Test content',
            url: '' // No valid URL in submission
          })
        },
        parent: {
          fetch: jest.fn().mockResolvedValue({
            body: 'No URL here'
          })
        }
      };

      // Mock the extractUrl method to always return null
      jest.spyOn(bot as any, 'extractUrl').mockReturnValue(null);

      const url = await (bot as any).findUrlInContext(commentWithoutUrl);
      expect(url).toBeNull();
    });
  });

  describe('processComment', () => {
    beforeEach(() => {
      // Reset any mocks before each test
      jest.clearAllMocks();
    });

    it('should process comment and reply with summary', async () => {
      const mockResponse = {
        data: {
          title: 'Test Article',
          assessment: 'This is clickbait',
          summary: 'Test summary',
          url: 'https://example.com/article'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await (bot as any).processComment(mockComment);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/summarize',
        { url: 'https://example.com/article' }
      );
      expect(mockComment.reply).toHaveBeenCalled();
    });

    it('should not process comment without URL', async () => {
      const commentWithoutUrl = {
        ...mockComment,
        body: 'No URL here u/SaveMeAClickBot',
        submission: {
          fetch: jest.fn().mockResolvedValue({
            title: 'Test Post',
            selftext: 'Test content',
            url: 'https://example.com/other'
          })
        },
        parent: {
          fetch: jest.fn().mockResolvedValue({
            body: 'No URL here'
          })
        },
        reply: jest.fn().mockResolvedValue(undefined)
      };

      // Mock findUrlInContext to return null
      jest.spyOn(bot as any, 'findUrlInContext').mockResolvedValueOnce(null);

      await (bot as any).processComment(commentWithoutUrl);

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(commentWithoutUrl.reply).toHaveBeenCalledWith(
        expect.stringContaining('I couldn\'t find any article URL')
      );
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

      await (bot as any).processComment(mockComment);

      expect(mockComment.reply).toHaveBeenCalledWith(
        'Sorry, I encountered an error while processing that article. Please try again later.'
      );
    });
  });

  describe('startMonitoring', () => {
    it('should start monitoring for mentions', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      await bot.startMonitoring();

      expect(consoleSpy).toHaveBeenCalledWith('Starting Reddit bot monitoring...');
      expect(Snoowrap).toHaveBeenCalled();
    });
  });
}); 