<img width="1919" height="864" alt="image" src="https://github.com/user-attachments/assets/fce93461-5dee-4131-84e8-00e359e11839" />
<img width="1917" height="862" alt="image" src="https://github.com/user-attachments/assets/32b270db-9c60-48d7-ab91-038ee0980585" />
<img width="1919" height="867" alt="image" src="https://github.com/user-attachments/assets/5f10795c-845a-46b3-84ec-28f18e7f9b60" />
<img width="1919" height="860" alt="image" src="https://github.com/user-attachments/assets/4e41fcee-3f76-416c-9cfa-627199c3a532" />
<img width="1919" height="855" alt="image" src="https://github.com/user-attachments/assets/15c0c981-2361-4b29-868a-cbd92e546544" />
<img width="1919" height="861" alt="image" src="https://github.com/user-attachments/assets/938dbc6b-ef67-4f1d-a830-98ca008d7422" />
<img width="1919" height="861" alt="image" src="https://github.com/user-attachments/assets/1e8d42c2-d4ee-43d3-b123-ddda8e7ec705" />

<img width="1919" height="862" alt="image" src="https://github.com/user-attachments/assets/3a1f5127-ac92-40dd-b03d-0e267958978f" />
<img width="1919" height="862" alt="image" src="https://github.com/user-attachments/assets/f8d15de3-bc5c-47ba-8d6f-7de854fdfa0b" />

you can show/hide your pdf as well:-
<img width="1919" height="862" alt="image" src="https://github.com/user-attachments/assets/fd24e906-9490-4deb-8977-7a8d300a4802" />
<img width="1919" height="868" alt="image" src="https://github.com/user-attachments/assets/b3df9352-79e5-44c5-bf1c-41e8ffc7d7f8" />


# AI-Native PDF Chatbot 🧠💬

An intelligent, AI-powered "Chat with your PDF" application. Upload documents and have natural conversations with them using RAG (Retrieval-Augmented Generation).

![Project Preview](/placeholder-image.png)

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

