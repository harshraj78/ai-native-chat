import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";

export const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY || "NOT_SET",
    modelName: "text-embedding-004", // Updated to fix timeout issues
    taskType: TaskType.RETRIEVAL_DOCUMENT,
});
