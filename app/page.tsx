"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/utils/types";
import { cn } from "@/lib/utils";
import remarkGfm from 'remark-gfm';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [csvContent, setCsvContent] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTimestamp = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(new Date(timestamp));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        setCsvContent(content as string);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent || !input.trim()) return;

    setIsLoading(true);
    const newUserMessage: ChatMessage = {
      role: "user",
      content: input,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInput("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          csvContent,
          question: input,
          history: messages
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const newAssistantMessage: ChatMessage = {
        role: "assistant",
        content: data.text,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, newAssistantMessage]);
    } catch (error: unknown) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error && error.message === "API quota exceeded. Please try again later."
        ? "API quota exceeded. Please try again in a few minutes."
        : "Sorry, there was an error processing your request.";
      
      const errorAssistantMessage: ChatMessage = {
        role: "assistant",
        content: errorMessage,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChatHistory = () => {
    setMessages([]);
  };

  const renderChart = (chartData: string) => {
    try {
      const data = JSON.parse(chartData);
      const { type, chartData: values, options = {} } = data;

      const commonProps = {
        height: 400,
        margin: { top: 20, right: 30, left: 20, bottom: 5 }
      };

      const chartTypes = {
        bar: (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={values} {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        ),
        line: (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={values} {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        ),
        pie: (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart {...commonProps}>
              <Pie
                data={values}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label
              >
                {values.map((entry: { name: string; value: number }, index: number) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${(index * 360) / values.length}, 70%, 50%)`} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )
      };

      return (
        <div className="my-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {options.title && (
            <h4 className="text-center mb-4 text-gray-700 dark:text-gray-300 font-medium">
              {options.title}
            </h4>
          )}
          {chartTypes[type as keyof typeof chartTypes] || (
            <p className="text-red-500">Unsupported chart type: {type}</p>
          )}
        </div>
      );
    } catch (error) {
      console.error('Failed to parse chart data:', error);
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <main className="max-w-4xl mx-auto space-y-8 backdrop-blur-sm">
        <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 pb-2">Chat with your CSV</h1>
        
        {!csvContent ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-10 text-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
            <Input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csvFile"
            />
            <label
              htmlFor="csvFile"
              className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {file ? file.name : "Upload CSV File"}
            </label>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-white/80 dark:bg-gray-800/80 rounded-lg p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-gray-800 dark:text-gray-100 truncate max-w-xs">{file?.name}</span>
            </div>
            <Button 
              onClick={() => {setFile(null); setCsvContent(null);}}
              className="text-gray-500 hover:text-red-500 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Button>
          </div>
        )}

        <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 h-[400px] overflow-y-auto shadow-md backdrop-blur-sm border border-gray-100 dark:border-gray-700">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>Ask questions about your CSV data</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.timestamp}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} group`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl relative ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                    }`}
                  >
                    <div className="absolute -top-5 left-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {formatTimestamp(message.timestamp)}
                    </div>
                    
                    {message.role === "user" ? (
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="whitespace-pre-wrap pt-1">{message.content}</p>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          {isLoading && index === messages.length - 1 ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-pulse flex space-x-1">
                                <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                                <div className="h-2 w-2 bg-purple-500 rounded-full animation-delay-200"></div>
                                <div className="h-2 w-2 bg-purple-500 rounded-full animation-delay-400"></div>
                              </div>
                            </div>
                          ) : (
                            <div className="prose dark:prose-invert prose-sm max-w-none">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  h1: ({ children }) => (
                                    <h1 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text">
                                      {children}
                                    </h1>
                                  ),
                                  h2: ({ children }) => (
                                    <h2 className="text-xl font-semibold mb-3 text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                                      {children}
                                    </h2>
                                  ),
                                  h3: ({ children }) => (
                                    <h3 className="text-lg font-medium mb-2 text-gray-600 dark:text-gray-300">
                                      {children}
                                    </h3>
                                  ),
                                  p: ({ children }) => (
                                    <p className="mb-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                                      {children}
                                    </p>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="mb-4 space-y-2 list-disc list-inside text-gray-600 dark:text-gray-300">
                                      {children}
                                    </ul>
                                  ),
                                  ol: ({ children }) => (
                                    <ol className="mb-4 space-y-2 list-decimal list-inside text-gray-600 dark:text-gray-300">
                                      {children}
                                    </ol>
                                  ),
                                  li: ({ children }) => (
                                    <li className="ml-4 text-gray-600 dark:text-gray-300">
                                      {children}
                                    </li>
                                  ),
                                  table: ({ children, ...props }) => (
                                    <div className="my-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                                      <table className="w-full border-collapse table-auto bg-white dark:bg-gray-800" {...props}>
                                        {children}
                                      </table>
                                    </div>
                                  ),
                                  thead: ({ children }) => (
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                      {children}
                                    </thead>
                                  ),
                                  tbody: ({ children }) => (
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                      {children}
                                    </tbody>
                                  ),
                                  tr: ({ children }) => (
                                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                      {children}
                                    </tr>
                                  ),
                                  th: ({ children, align }) => (
                                    <th 
                                      className={cn(
                                        "px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700",
                                        {
                                          "text-left": align === "left" || !align,
                                          "text-center": align === "center",
                                          "text-right": align === "right"
                                        }
                                      )}
                                    >
                                      {children}
                                    </th>
                                  ),
                                  td: ({ children, align }) => (
                                    <td 
                                      className={cn(
                                        "px-6 py-4 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap",
                                        {
                                          "text-left": align === "left" || !align,
                                          "text-center": align === "center",
                                          "text-right": align === "right"
                                        }
                                      )}
                                    >
                                      {children}
                                    </td>
                                  ),
                                  code: ({ className, children, ...props }) => {
                                    const match = /language-(\w+)/.exec(className || '');
                                    const language = match ? match[1] : '';
                                    
                                    // Handle chart blocks
                                    if (language === 'chart') {
                                      return renderChart(children as string);
                                    }
                                    
                                    // Regular code blocks
                                    return match ? (
                                      <div className="relative group">
                                        <div className="absolute -top-3 right-4 px-2 py-1 text-xs font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                          {match[1]}
                                        </div>
                                        <pre className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-x-auto">
                                          <code className={cn(
                                            "text-sm font-mono text-gray-800 dark:text-gray-200",
                                            className
                                          )} {...props}>
                                            {children}
                                          </code>
                                        </pre>
                                      </div>
                                    ) : (
                                      <code className="px-1.5 py-0.5 text-sm font-mono text-purple-600 dark:text-purple-400 bg-gray-100 dark:bg-gray-800 rounded" {...props}>
                                        {children}
                                      </code>
                                    );
                                  },
                                  pre: ({ children }) => (
                                    <pre className="mb-4 rounded-lg shadow-sm">
                                      {children}
                                    </pre>
                                  ),
                                  blockquote: ({ children }) => (
                                    <blockquote className="border-l-4 border-purple-500 dark:border-purple-400 pl-4 my-4 italic text-gray-600 dark:text-gray-300">
                                      {children}
                                    </blockquote>
                                  ),
                                  a: ({ children, href }) => (
                                    <a 
                                      href={href}
            target="_blank"
            rel="noopener noreferrer"
                                      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline transition-colors"
                                    >
                                      {children}
                                    </a>
                                  ),
                                  strong: ({ children }) => (
                                    <strong className="font-semibold text-gray-800 dark:text-gray-100">
                                      {children}
                                    </strong>
                                  ),
                                  em: ({ children }) => (
                                    <em className="text-gray-700 dark:text-gray-200 italic">
                                      {children}
                                    </em>
                                  ),
                                  hr: () => (
                                    <hr className="my-6 border-gray-200 dark:border-gray-700" />
                                  )
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 bg-white/80 dark:bg-gray-800/80 p-2 rounded-xl shadow-md backdrop-blur-sm border border-gray-100 dark:border-gray-700">
          {messages.length > 0 && (
            <Button
              type="button"
              onClick={clearChatHistory}
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              title="Clear chat history"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 transition-transform hover:rotate-12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                <line x1="10" y1="11" x2="10" y2="17" />
                <line x1="14" y1="11" x2="14" y2="17" />
              </svg>
            </Button>
          )}
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your CSV data..."
            className="flex-1 px-4 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-gray-800 dark:text-white placeholder-gray-400"
            disabled={!csvContent || isLoading}
          />
          <Button
            type="submit"
            disabled={!csvContent || isLoading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <span className="flex items-center gap-1">
                Send
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </Button>
        </form>
        <footer className="text-center text-gray-500 text-sm mt-4">
          <p>
            © {new Date().getFullYear() === 2025 ? '2025' : `2025 - ${new Date().getFullYear()}`}. Created with ❤️ by <a href="https://gaurav-wankhede.vercel.app/" target="_blank" rel="noopener noreferrer"><span className="font-bold hover:text-blue-500">Gaurav Wankhede</span></a>
          </p>
        </footer>
      </main>
    </div>
  );
}
