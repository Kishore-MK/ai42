import { Hono } from "hono";
import { serve } from "@hono/node-server"; 
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { config } from './config/env.js';
import chatRouter from './routes/chat.js';

const app = new Hono();

app.use('*', logger());
app.use('*', cors());

app.get('/health', (c) => {
  return c.json({ 
    status: 'healthy',
    timestamp: Date.now()
  });
});

app.route('/chat', chatRouter);

app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ 
    error: err.message || 'Internal server error' 
  }, 500);
});

console.log(`AI42 Gateway starting on port ${config.port}`);

 

serve({
  fetch: app.fetch,
  port: config.port,
});