# The ClickBait Crusader

A service that summarizes articles and detects clickbait titles using OpenAI's GPT-4. Provides instant analysis of article quality, readability, and potential clickbait content.

## Features

- Article content extraction
- Article summarization using OpenAI's GPT-4
- Clickbait detection and scoring
- Quality analysis including:
  - Overall quality score
  - Readability assessment
  - Objectivity rating
  - Content depth analysis
- Time-saving metrics
- Modern, responsive UI
- Fast and efficient API service
- Comprehensive test suite
- Vercel deployment support

## Usage

### API Service

```http
POST /summarize
Content-Type: application/json

{
  "url": "https://example.com/article-url"
}
```

Response:
```json
{
  "title": "Article Title",
  "assessment": "Clickbait Assessment",
  "summary": "A concise summary of the article...",
  "url": "https://example.com/article-url",
  "qualityScore": 85,
  "clickbaitScore": 30,
  "timeSaved": 5,
  "processingTime": 2.5,
  "contentQuality": {
    "readability": 90,
    "objectivity": 85,
    "depth": 75
  },
  "keyPoints": [
    "Key point 1",
    "Key point 2",
    "Key point 3"
  ]
}
```

### Web Interface

The web interface provides a user-friendly way to analyze articles:

1. Enter an article URL
2. Get instant analysis including:
   - Article summary
   - Clickbait assessment
   - Quality metrics
   - Time-saving estimate
   - Content quality breakdown

## Deployment

This application is configured for deployment on Vercel. To deploy:

1. Install Vercel CLI (optional):
   ```bash
   npm i -g vercel
   ```

2. Deploy using one of these methods:
   - Connect your GitHub repository to Vercel for automatic deployments
   - Run `vercel` in your project directory for manual deployment

3. Configure environment variables in the Vercel dashboard:
   - Add all required environment variables
   - Set up both Production and Preview environments

## Support and Donations

This project is maintained as a service to help users avoid clickbait and get accurate article summaries. If you find it useful, please consider:

- [Buy Me a Coffee](https://www.buymeacoffee.com/yourusername)

Your support helps maintain and improve the service!

## License

This project is proprietary software. All rights reserved.

- The code is provided for reference and educational purposes only
- Commercial use requires explicit permission
- Redistribution is not allowed
- Modifications are not allowed without permission

## Contact

For business inquiries, custom integrations, or licensing:
- Email: jmorg.21@outlook.com
- GitHub: [@jmorg-9](https://github.com/jmorg-9)
