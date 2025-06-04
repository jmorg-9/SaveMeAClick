import { InstagramBot } from '../../src/integrations/instagramBot.js';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('InstagramBot', () => {
  let bot: InstagramBot;
  let mockMention: any;
  let mockConfig: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock config
    mockConfig = {
      INSTAGRAM_PAGE_ACCESS_TOKEN: 'test-token',
      INSTAGRAM_BASE_URL: 'https://graph.instagram.com',
      INSTAGRAM_API_VERSION: 'v18.0',
      API_URL: 'http://localhost:3000'
    };

    // Create bot instance
    bot = new InstagramBot(mockConfig);

    // Mock mention
    mockMention = {
      id: 'test-mention-id',
      text: 'Check this out https://example.com/article',
      username: 'testuser',
      media_id: 'test-media-id',
      parent_id: 'test-parent-id'
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

  describe('getMediaCaption', () => {
    it('should fetch media caption', async () => {
      const mockResponse = {
        data: {
          caption: 'Check this article https://example.com/article'
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const caption = await (bot as any).getMediaCaption('test-media-id');
      expect(caption).toBe('Check this article https://example.com/article');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/test-media-id'),
        expect.objectContaining({
          params: expect.objectContaining({
            fields: 'caption'
          })
        })
      );
    });
  });

  describe('getParentComment', () => {
    it('should fetch parent comment', async () => {
      const mockResponse = {
        data: {
          text: 'Check this article https://example.com/article'
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const text = await (bot as any).getParentComment('test-parent-id');
      expect(text).toBe('Check this article https://example.com/article');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/test-parent-id'),
        expect.objectContaining({
          params: expect.objectContaining({
            fields: 'parent_id,text'
          })
        })
      );
    });
  });

  describe('findUrlInContext', () => {
    it('should find URL in mention text', async () => {
      const url = await (bot as any).findUrlInContext(mockMention);
      expect(url).toBe('https://example.com/article');
    });

    it('should find URL in media caption', async () => {
      const mentionWithoutUrl = {
        ...mockMention,
        text: 'No URL here'
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: {
          caption: 'Check this article https://example.com/article'
        }
      });

      const url = await (bot as any).findUrlInContext(mentionWithoutUrl);
      expect(url).toBe('https://example.com/article');
    });

    it('should find URL in parent comment', async () => {
      const mentionWithoutUrl = {
        ...mockMention,
        text: 'No URL here'
      };

      // Mock empty media caption response
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          caption: ''
        }
      });

      // Mock parent comment response
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          text: 'Check this article https://example.com/article'
        }
      });

      const url = await (bot as any).findUrlInContext(mentionWithoutUrl);
      expect(url).toBe('https://example.com/article');
    });
  });

  describe('processMention', () => {
    it('should process mention and reply with summary', async () => {
      const mockResponse = {
        data: {
          title: 'Test Article',
          assessment: 'This is clickbait',
          summary: 'Test summary',
          url: 'https://example.com/article'
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

      // Mock empty responses for media caption and parent comment
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          caption: ''
        }
      });
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          text: ''
        }
      });

      // Mock the reply to comment call
      mockedAxios.post.mockResolvedValueOnce({});

      await (bot as any).processMention(mentionWithoutUrl);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/test-mention-id/replies'),
        expect.objectContaining({
          message: expect.stringContaining('I couldn\'t find any article URL')
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      // Mock the summarize API call to fail
      mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

      // Mock the error reply call
      mockedAxios.post.mockResolvedValueOnce({});

      await (bot as any).processMention(mockMention);
      expect(mockedAxios.post).toHaveBeenCalledTimes(2);
    });
  });

  describe('startPolling', () => {
    it('should start polling for mentions', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      jest.useFakeTimers();

      // Mock successful mentions response
      mockedAxios.get.mockResolvedValueOnce({
        data: {
          data: []
        }
      });

      await bot.startPolling(1000);

      expect(consoleSpy).toHaveBeenCalledWith('Starting Instagram bot polling...');
      
      // Fast-forward time
      jest.advanceTimersByTime(1000);
      
      // Clean up
      jest.useRealTimers();
    });
  });
}); 