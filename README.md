# Coding Interview Prep Study Guide Generator

A Next.js application that generates personalized study guides for coding interviews based on job descriptions and interview timelines using OpenAI's API.

## Features

- **Smart Form**: Input your interview date (minimum tomorrow) and job description
- **AI-Powered**: Uses OpenAI's GPT-3.5-turbo to generate personalized study resources
- **Focused Resources**: Provides advanced and intermediate-level free online resources, video tutorials, and classes
- **Timeline-Aware**: Considers the number of days until your interview for optimal preparation planning

## Setup

1. **Clone and Install**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   - Copy `.env.example` to `.env.local`
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     ```

3. **Get OpenAI API Key**:
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Add it to your `.env.local` file

## Running the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the application.

## How It Works

1. **Home Page**: Enter your interview date and paste the job description
2. **Results Page**: AI generates a customized study guide with:
   - Free online resources
   - Video tutorials and classes
   - Advanced and intermediate-level content
   - Timeline-specific recommendations

## Tech Stack

- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **OpenAI API** for AI-powered content generation

## API Usage

The app uses OpenAI's `gpt-3.5-turbo` model to generate study guides. Make sure you have sufficient API credits in your OpenAI account.
