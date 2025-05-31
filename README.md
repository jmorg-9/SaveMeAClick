# Save Me A Click

An API service that summarizes articles and detects clickbait titles using OpenAI's GPT-4.

## Features

- Article content extraction using @extractus/article-extractor
- Article summarization using OpenAI's GPT-4
- Clickbait detection for article titles
- Fast and efficient Fastify server
- TypeScript support

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
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

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

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

## License

MIT
