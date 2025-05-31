import { InstagramBot } from '../../src/integrations/instagramBot.js';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('InstagramBot', () => {
  let bot: InstagramBot;
  let mockMention: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create bot instance
    bot = new InstagramBot();

    // Mock mention
    mockMention = {
      id: 'test-mention-id',
      text: 'Check this out https://example.com/article',
      username: 'testuser'
    };
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

  describe('getRecentMentions', () => {
    it('should fetch recent mentions', async () => {
      const mockResponse = {
        data: {
          data: [mockMention]
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const mentions = await (bot as any).getRecentMentions();
      expect(mentions).toEqual([mockMention]);
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('API Error'));

      const mentions = await (bot as any).getRecentMentions();
      expect(mentions).toEqual([]);
    });
  });

  describe('replyToComment', () => {
    it('should send reply to comment', async () => {
      const message = 'Test reply';
      await (bot as any).replyToComment('test-comment-id', message);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/test-comment-id/replies'),
        expect.objectContaining({
          message,
          access_token: expect.any(String)
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error');
      mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

      await (bot as any).replyToComment('test-comment-id', 'Test reply');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('processMention', () => {
    it('should process mention and reply with summary', async () => {
      const mockResponse = {
        data: {
          title: 'Test Article',
          summary: 'Test summary',
          isClickbait: false,
          clickbaitAssessment: 'Title is accurate'
        }
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      await (bot as any).processMention(mockMention);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3000/summarize',
        { url: 'https://example.com/article' }
      );
    });

    it('should not process mention without URL', async () => {
      const mentionWithoutUrl = {
        ...mockMention,
        text: 'No URL here'
      };

      await (bot as any).processMention(mentionWithoutUrl);
      expect(mockedAxios.post).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

      await (bot as any).processMention(mockMention);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2); // One for summarize, one for error reply
    });
  });

  describe('startPolling', () => {
    it('should start polling for mentions', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      jest.useFakeTimers();

      await bot.startPolling(1000);

      expect(consoleSpy).toHaveBeenCalledWith('Starting Instagram bot polling...');
      
      // Fast-forward time
      jest.advanceTimersByTime(1000);
      
      // Clean up
      jest.useRealTimers();
    });
  });
}); 