import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import mongoose from 'mongoose';
import { config } from 'dotenv';

config();

import responseRouter from './routes/response.js';
import roastRouter from './routes/roast.js';

const app = new Hono();

app.use('*', cors());

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("Error: DATABASE_URL is not defined in .env file");
  process.exit(1);
}

mongoose.connect(dbUrl)
  .then(() => {
    console.log("Database connected successfully!");
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });

const port = process.env.PORT || 3003;

app.get('/', (c) => c.text('Hello World!'));

app.route('/api/responses', responseRouter);
app.route('/api/roast', roastRouter);

serve({
  fetch: app.fetch,
  port,
});

console.log(`Server running at https://localhost:${port}`);
