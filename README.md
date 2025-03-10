# Chat with CSV 📊

> An interactive web application that lets you have conversations with your CSV data using AI.

## 🌟 Features

- **📄 CSV File Upload** - Easy drag & drop or click to upload
- **💬 Natural Language Queries** - Ask questions about your data in plain English
- **📊 Data Visualization** 
  - Bar charts
  - Line charts
  - Pie charts
- **🎨 Modern UI/UX**
  - Dark mode
  - Responsive design
  - Beautiful gradients
  - Smooth animations
- **🤖 AI-Powered Analysis**
  - Automatic data structure detection
  - Statistical insights
  - Trend analysis
  - Pattern recognition

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gaurav-Wankhede/Chat-With-CSV.git
   cd chat-with-csv
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Add your API keys:
   ```env
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   ```

4. **Start the development server**
   ```bash
   pnpm dev
   ```

5. **Open the application**
   Visit [http://localhost:3000](http://localhost:3000)

## 💻 Tech Stack

- **Frontend**
  - Next.js 15+ (App Router, Canary build)
  - React 19
  - Tailwind CSS
  - Recharts
  - React Markdown

- **Backend**
  - Next.js API Routes
  - Google AI SDK
  - TypeScript

- **UI Components**
  - Shadcn/ui
  - Tailwind CSS
  - Custom Components

## 📝 Usage

1. **Upload CSV**
   - Click the upload button or drag & drop your CSV file
   - The app will automatically analyze the structure

2. **Ask Questions**
   - Type your question in natural language
   - Examples:
     - "Show me the top 5 values"
     - "Create a bar chart of sales by month"
     - "What's the average value?"

3. **View Results**
   - Get instant AI-powered analysis
   - View auto-generated visualizations
   - Explore data insights

## 🛠️ Development

### Prerequisites
- Node.js 18+
- pnpm
- Google AI API key

### Project Structure
```
chat-with-csv/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts    # API endpoint
│   └── page.tsx            # Main page
├── components/             # UI components
├── lib/                    # Utility functions
├── utils/                  # Helper functions
└── public/                 # Static assets
```

### Commands
```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm start      # Start production server
pnpm lint       # Run linter
pnpm test       # Run tests
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Gaurav Wankhede**
- Website: [gaurav-wankhede.vercel.app](https://gaurav-wankhede.vercel.app/)
- GitHub: [@Gaurav-Wankhede](https://github.com/Gaurav-Wankhede)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org)
- [Google AI](https://ai.google.dev/)
- [Recharts](https://recharts.org)
- [Shadcn/ui](https://ui.shadcn.com)

---

<p align="center">Made with ❤️ by <a href="https://gaurav-wankhede.vercel.app/">Gaurav Wankhede</a></p>
