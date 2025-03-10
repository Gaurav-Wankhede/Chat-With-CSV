export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatRequest {
  csvContent: string;
  question: string;
  history: ChatMessage[];
}

export interface ChatResponse {
  text: string;
  error?: string;
} 