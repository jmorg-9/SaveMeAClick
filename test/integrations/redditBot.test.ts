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

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create bot instance
    bot = new RedditBot();

    // Mock comment
    mockComment = {
      id: 'test-comment-id',
      body: 'Check this out u/SaveMeAClickBot https://example.com/article',
      reply: jest.fn().mockResolvedValue(undefined)
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

  describe('formatReply', () => {
    it('should format reply with clickbait warning', () => {
      const response = {
        title: 'Test Article',
        summary: 'Test summary',
        isClickbait: true,
        clickbaitAssessment: 'This is clickbait'
      };

      const reply = (bot as any).formatReply(response);
      expect(reply).toContain('⚠️ Clickbait detected!');
      expect(reply).toContain('Test summary');
      expect(reply).toContain('This is clickbait');
    });

    it('should format reply with accurate title indicator', () => {
      const response = {
        title: 'Test Article',
        summary: 'Test summary',
        isClickbait: false,
        clickbaitAssessment: 'Title is accurate'
      };

      const reply = (bot as any).formatReply(response);
      expect(reply).toContain('✅ Title appears accurate');
      expect(reply).toContain('Test summary');
      expect(reply).toContain('Title is accurate');
    });
  });

  describe('processComment', () => {
    it('should process comment and reply with summary', async () => {
      const mockResponse = {
        data: {
          title: 'Test Article',
          summary: 'Test summary',
          isClickbait: false,
          clickbaitAssessment: 'Title is accurate'
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
        body: 'No URL here u/SaveMeAClickBot'
      };

      await (bot as any).processComment(commentWithoutUrl);

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(mockComment.reply).not.toHaveBeenCalled();
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