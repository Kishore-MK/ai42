import {z, ZodString} from 'zod';
import 'dotenv/config';
 

const envSchema = z.object({
    PORT: z.string().min(1, 'PORT is required'),
    ADDRESS: z.string().min(1, 'SOLANA ADDRESS is required'),
    FACILITATOR_URL: z.string().min(1, 'FACILITATOR URL'),
    NETWORK: z.string().min(1, 'NETWORK is required'),
    DATABASE_URL: z.string().min(1, 'DATABASE URL is required'),
    GROQ_API_KEY: z.string().min(1, 'GROQ API KEY is required'),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1, 'GEMINI API KEY is required'),
    BASE_URL: z.string().min(1, 'BASE URL is required')
})

const env = envSchema.parse(process.env);

export const config = {
  port: parseInt(env.PORT, 10),
  address: env.ADDRESS,
  facilitatorUrl: env.FACILITATOR_URL,
  network: env.NETWORK,
  databaseUrl: env.DATABASE_URL,
  groqApiKey: env.GROQ_API_KEY,
  geminiApiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
  baseUrl: env.BASE_URL
};