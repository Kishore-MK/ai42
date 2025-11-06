import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { paymentMiddleware, Network, Resource } from "x402-hono";

import 'dotenv/config';
import { getResponse } from "./agent/chat.js";
import { createUser } from "./db/actions.js";


const facilitatorUrl = process.env.FACILITATOR_URL as Resource;
const payTo = process.env.ADDRESS as `0x${string}`;
const network = process.env.NETWORK as Network;

if (!facilitatorUrl || !payTo || !network) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const app = new Hono();

console.log("Server is running");

app.use(
  paymentMiddleware(
    payTo,
    {
      "/weather": {
        price: "$0.001",
        network,
      },
    },
    {
      url: facilitatorUrl,
    },
  ),
);


app.post('/chat', async (c) => {
  const { message, userId } = await c.req.json()

  if (!userId) {
    return c.json({Error:"userId required"})
  }
  
  const result= await getResponse(message,userId)
  
  
  return c.json({ response: result })
})

app.post('/signup', async (c) => {
  const userId = await createUser()
  return c.json({ userId })
})

app.get("/weather", c => {
  return c.json({
    report: {
      weather: "sunny",
      temperature: 70,
    },
  });
});

serve({
  fetch: app.fetch,
  port: 4021,
});