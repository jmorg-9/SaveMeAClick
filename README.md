# Save Me A Click

An API service that summarizes articles and detects clickbait titles using OpenAI's GPT-4. Includes Instagram and Reddit bot integrations that can automatically summarize articles mentioned in comments.

## Features

- Article content extraction using @extractus/article-extractor
- Article summarization using OpenAI's GPT-4
- Clickbait detection for article titles
- Fast and efficient Fastify server
- TypeScript support
- Instagram bot integration for automatic article summarization
- Reddit bot integration for automatic article summarization
- Comprehensive test suite

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with:
   ```
   OPENAI_API_KEY=your_api_key_here
   PORT=3000
   
   # Instagram Bot Configuration
   INSTAGRAM_PAGE_ACCESS_TOKEN=your_token_here
   INSTAGRAM_APP_ID=your_app_id_here
   
   # Reddit Bot Configuration
   REDDIT_USER_AGENT=SaveMeAClickBot/1.0.0
   REDDIT_CLIENT_ID=your_client_id
   REDDIT_CLIENT_SECRET=your_client_secret
   REDDIT_USERNAME=your_bot_username
   REDDIT_PASSWORD=your_bot_password
   ```

### Instagram Bot Setup

1. Create a Facebook Developer account at https://developers.facebook.com
2. Create a new app and add Instagram Basic Display API
3. Convert your Instagram account to a Professional account
4. Connect your Instagram account to your Facebook Page
5. Generate a Page Access Token with the following permissions:
   - instagram_basic
   - instagram_manage_comments
   - instagram_manage_messages
   - pages_show_list
   - pages_read_engagement

### Reddit Bot Setup

1. Create a Reddit account for your bot
2. Go to https://www.reddit.com/prefs/apps
3. Click "create another app..."
4. Fill in the details:
   - Name: SaveMeAClickBot
   - Type: script
   - Description: Bot that summarizes articles and detects clickbait
   - About URL: (optional)
   - Redirect URI: http://localhost:8080
5. Note down the client ID (under the app name) and client secret

## API Usage

### Summarize Article

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

The Instagram bot will:
1. Monitor comments and mentions where the bot is tagged
2. Extract URLs from the comments
3. Summarize the articles and check for clickbait
4. Reply with the summary and clickbait assessment

To start the bot:
```typescript
import { InstagramBot } from './integrations/instagramBot';

const bot = new InstagramBot();
bot.startPolling(); // Polls every 60 seconds by default
```

### Reddit Bot

The Reddit bot will:
1. Monitor mentions of u/SaveMeAClickBot in comments
2. Extract URLs from the comments
3. Summarize the articles and check for clickbait
4. Reply with the summary and clickbait assessment

To start the bot:
```typescript
import { RedditBot } from './integrations/redditBot';

const bot = new RedditBot();
bot.startMonitoring();
```

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

## Testing

The project includes a comprehensive test suite using Jest. Tests cover:
- URL extraction
- Reply formatting
- API integration
- Error handling
- Bot initialization and monitoring

To run the tests:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

Create a `.env.test` file for test-specific environment variables:
```
OPENAI_API_KEY=test-openai-key
INSTAGRAM_PAGE_ACCESS_TOKEN=test-instagram-token
INSTAGRAM_APP_ID=test-instagram-app-id
REDDIT_USER_AGENT=SaveMeAClickBot/1.0.0
REDDIT_CLIENT_ID=test-reddit-client-id
REDDIT_CLIENT_SECRET=test-reddit-client-secret
REDDIT_USERNAME=test-reddit-username
REDDIT_PASSWORD=test-reddit-password
```

## License

MIT
