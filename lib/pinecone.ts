import { Pinecone } from '@pinecone-database/pinecone';

export const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || 'NOT_SET',
});

export const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'pdf-chat';
