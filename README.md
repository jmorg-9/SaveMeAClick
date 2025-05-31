# Save Me A Click

A service that summarizes articles and detects clickbait titles using OpenAI's GPT-4. Includes Instagram and Reddit bot integrations that automatically summarize articles mentioned in comments.

## Features

- Article content extraction
- Article summarization using OpenAI's GPT-4
- Clickbait detection for article titles
- Fast and efficient API service
- Instagram bot integration
- Reddit bot integration
- Comprehensive test suite

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
  "summary": "Concise summary of the article...",
  "isClickbait": true,
  "clickbaitAssessment": "Assessment of whether the title is clickbait..."
}
```

### Instagram Bot

The Instagram bot monitors comments and mentions, automatically summarizing articles and detecting clickbait. To use the bot:

1. Tag @SaveMeAClickBot in a comment with an article URL
2. The bot will reply with:
   - Article summary
   - Clickbait assessment
   - Accuracy rating

### Reddit Bot

The Reddit bot monitors mentions of u/SaveMeAClickBot, automatically summarizing articles and detecting clickbait. To use the bot:

1. Mention u/SaveMeAClickBot in a comment with an article URL
2. The bot will reply with:
   - Article summary
   - Clickbait assessment
   - Accuracy rating

## Support and Donations

This project is maintained as a service to help users avoid clickbait and get accurate article summaries. If you find it useful, please consider:

- [GitHub Sponsors](https://github.com/sponsors/jmorg-9)
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
