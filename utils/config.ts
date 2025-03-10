if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not set in environment variables');
  }
  
  export const config = {
    googleAiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
  } as const; 