<img width="1919" height="864" alt="image" src="https://github.com/user-attachments/assets/fce93461-5dee-4131-84e8-00e359e11839" />
<img width="1917" height="862" alt="image" src="https://github.com/user-attachments/assets/32b270db-9c60-48d7-ab91-038ee0980585" />
<img width="1919" height="867" alt="image" src="https://github.com/user-attachments/assets/5f10795c-845a-46b3-84ec-28f18e7f9b60" />
<img width="1919" height="860" alt="image" src="https://github.com/user-attachments/assets/4e41fcee-3f76-416c-9cfa-627199c3a532" />

# AI-Native PDF Chatbot 🧠💬

An intelligent, AI-powered "Chat with your PDF" application. Upload documents and have natural conversations with them using RAG (Retrieval-Augmented Generation).

## 🚀 Features

-   **Deep PDF Understanding**: Uses Google's Gemini Pro AI to analyze and summarize entire documents.
-   **RAG Pipeline**: Vector embeddings (Google GenAI) + Pinecone Vector DB for accurate, context-aware answers.
-   **Smart Split-View**:
    -   **Desktop**: Resizable split-screen (PDF on left, Chat on right).
    -   **Mobile**: Adaptive Tab-based interface for seamless switching.
-   **Real-time Streaming**: AI responses stream character-by-character for a polished feel.
-   **Secure**: Row Level Security ensures users only see their own chats.
-   **PDF Viewer**: Custom PDF rendering with continuous scrolling and zoom.

## 🛠️ Tech Stack

-   **Frontend**: Next.js 16 (App Router), Tailwind CSS, Framer Motion, Radix UI.
-   **Backend**: Next.js Server Actions, Prisma ORM.
-   **Database**: PostgreSQL (Neon Serverless).
-   **Vector DB**: Pinecone.
-   **AI Model**: Google Gemini Pro (via LangChain).
-   **Auth**: Clerk (Middleware protected).
-   **Payment**: Stripe (Checkout sessions).

## ⚙️ Environment Variables

Create a \`.env.local\` file in the root directory:

\`\`\`env
# Database (Neon / PostgreSQL)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# AI & Vectors
GOOGLE_API_KEY="AIzaSy..."
PINECONE_API_KEY="pc_..."
PINECONE_INDEX_NAME="ai-native-chat"

# Payments
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
\`\`\`

## 🏃‍♂️ Getting Started

1.  **Clone the repo**
    \`\`\`bash
    git clone https://github.com/your-username/ai-native-chat.git
    cd ai-native-chat
    \`\`\`

2.  **Install dependencies**
    \`\`\`bash
    npm install
    # or
    yarn install
    \`\`\`

3.  **Setup Database**
    \`\`\`bash
    npx prisma generate
    npx prisma db push
    \`\`\`

4.  **Run the app**
    \`\`\`bash
    npm run dev
    \`\`\`

## 📄 License

MIT License. Copyright © 2026.

