const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
};

const app = express();

const client = new line.Client(config);

const receivedEvents = new Map();
const EVENT_CACHE_TTL = 1000 * 60 * 60; // เก็บ eventId ไว้ 1 ชั่วโมง

setInterval(() => {
  const now = Date.now();
  for (const [eventId, ts] of receivedEvents.entries()) {
    if (now - ts > EVENT_CACHE_TTL) {
      receivedEvents.delete(eventId);
    }
  }
}, 1000 * 60);

app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

app.use(express.json());

function handleEvent(event) {
  if (!event.webhookEventId) {
    console.warn('Missing webhookEventId:', event);
    return Promise.resolve(null);
  }

  if (receivedEvents.has(event.webhookEventId)) {
    console.log('Duplicate event ignored:', event.webhookEventId);
    return Promise.resolve(null);
  }

  receivedEvents.set(event.webhookEventId, Date.now());

  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const reply = {
    type: 'text',
    text: `คุณพิมพ์ว่า: ${event.message.text}`,
  };

  return client.replyMessage(event.replyToken, reply);
}

const port = process.env.PORT || 3000;
app.get('/', (req, res) => {
  res.send('OK');
});

app.listen(port, () => {
  console.log(`LINE bot listening on port ${port}`);
});
