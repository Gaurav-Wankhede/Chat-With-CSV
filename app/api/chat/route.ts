import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { config } from '@/utils/config';
import { SYSTEM_PROMPT } from '@/utils/prompt';
import { ChatMessage, ChatRequest, ChatResponse } from '@/utils/types';

// Constants for token limits
const MAX_RESPONSE_TOKENS = 2048;
const MAX_HISTORY_MESSAGES = 10;

const google = createGoogleGenerativeAI({
  apiKey: config.googleAiKey
});

// Improved token estimation
const estimateTokens = (text: string): number => {
  return Math.ceil(text.split(/\s+/).length * 1.5);
};

// Format numbers consistently
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Process CSV data to provide structure information
const analyzeCSVStructure = (csvContent: string): string => {
  try {
    const lines = csvContent.trim().split('\n');
    if (lines.length === 0) return "Empty CSV file";

    const headers = lines[0].split(',').map(h => h.trim());
    const sampleData = lines.slice(1, 4);
    const rowCount = lines.length - 1;
    
    // Create markdown table for sample data
    const tableHeaders = `| ${headers.join(' | ')} |`;
    const tableDivider = `| ${headers.map(() => '---').join(' | ')} |`;
    const tableRows = sampleData.map(row => {
      const cells = row.split(',').map(cell => cell.trim());
      return `| ${cells.join(' | ')} |`;
    });
    
    const analysis = `## Dataset Overview

### Structure
- **Total Records:** \`${formatNumber(rowCount)}\`
- **Fields:** \`${headers.length}\`

### Columns
${headers.map((h, i) => `${i + 1}. **${h}**`).join('\n')}

### Preview
${tableHeaders}
${tableDivider}
${tableRows.join('\n')}

\`\`\`csv
# First ${sampleData.length} rows of data
${sampleData.join('\n')}
\`\`\``;

    return analysis;
  } catch {
    return csvContent.trim();
  }
};

// Enhanced history processing with better markdown formatting
const processHistory = (history: ChatMessage[]): string => {
  if (history.length === 0) return "";
  
  const processedHistory = history
    .slice(-MAX_HISTORY_MESSAGES)
    .map(msg => {
      const role = msg.role === 'user' ? '👤 **User**' : '🤖 **Assistant**';
      return `${role}:\n${msg.content.trim()}`;
    })
    .join('\n\n---\n\n');

  return `### Conversation History\n\n${processedHistory}`;
};

// Format the AI response in markdown
const formatResponse = (text: string): string => {
  // Ensure the response starts with a heading
  let formatted = text.trim();
  if (!formatted.startsWith('#')) {
    formatted = `# Analysis\n\n${formatted}`;
  }

  // Add a section for follow-up questions if not present
  if (!formatted.toLowerCase().includes('follow-up') && !formatted.toLowerCase().includes('next steps')) {
    formatted += '\n\n### Suggested Follow-up Questions\n- What other aspects of the data would you like to explore?\n- Would you like to see any specific trends or patterns?\n- Should we analyze any particular relationships in the data?';
  }

  return formatted;
};

export async function POST(req: Request) {
  try {
    const { csvContent, question, history }: ChatRequest = await req.json();

    if (!csvContent || !question) {
      return NextResponse.json(
        { error: "Missing required fields" } as ChatResponse,
        { status: 400 }
      );
    }

    // Process CSV structure
    const csvAnalysis = analyzeCSVStructure(csvContent);
    // Process conversation history
    const truncatedHistory = history.slice(-MAX_HISTORY_MESSAGES);
    const conversationContext = processHistory(truncatedHistory);

    // Construct enhanced prompt
    const prompt = `${SYSTEM_PROMPT}

${csvAnalysis}

${conversationContext ? `${conversationContext}\n` : ''}

Current Question: ${question}

Focus on:
1. Providing accurate analysis
2. Including specific data points
3. Highlighting key trends
4. Making data-driven recommendations
5. Suggesting relevant follow-up questions`;

    const { text } = await generateText({
      model: google("gemini-2.0-flash-exp", {
        safetySettings: [
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
      prompt
    });

    // Format the response in markdown
    const formattedResponse = formatResponse(text);

    // Verify response length
    if (estimateTokens(formattedResponse) > MAX_RESPONSE_TOKENS) {
      return NextResponse.json(
        { error: "Response too long. Please try a more specific question." } as ChatResponse,
        { status: 400 }
      );
    }

    return NextResponse.json({ text: formattedResponse } as ChatResponse);
  } catch (error: unknown) {
    console.error("Error:", error);
    
    if (error instanceof Error && 'lastError' in error && 
        typeof error.lastError === 'object' && error.lastError && 
        'statusCode' in error.lastError && 
        error.lastError.statusCode === 429) {
      return NextResponse.json(
        { error: "API quota exceeded. Please try again in a few minutes." } as ChatResponse,
        { status: 429 }
      );
    }

    if (error instanceof Error && error.message.includes('token')) {
      return NextResponse.json(
        { error: "The CSV file or question is too long. Please try a smaller file or a more specific question." } as ChatResponse,
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to process your request. Please try again." } as ChatResponse,
      { status: 500 }
    );
  }
}