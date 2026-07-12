const express = require('express');
const line = require('@line/bot-sdk');

const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
};

const app = express();

const client = new line.Client(config);
const drive = require('./drive');

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
    // handle media messages (image, video, audio, file)
    if (event.message && event.message.id) {
      const msgType = event.message.type;
      if (['image', 'video', 'audio', 'file'].includes(msgType)) {
        return client.getMessageContent(event.message.id)
          .then(async (stream) => {
            const chunks = [];
            for await (const chunk of stream) chunks.push(chunk);
            const buffer = Buffer.concat(chunks);
            const ext = msgType === 'image' ? 'jpg' : (msgType === 'audio' ? 'm4a' : (msgType === 'video' ? 'mp4' : 'bin'));
            const filename = `line_${event.webhookEventId || Date.now()}.${ext}`;
            try {
              const file = await drive.uploadBuffer(buffer, filename, event.message.contentType || 'application/octet-stream');
              // reply with link if available
              const replyText = file.webViewLink ? `ไฟล์อัพโหลดแล้ว: ${file.webViewLink}` : `ไฟล์อัพโหลดเรียบร้อย (id: ${file.id})`;
              return client.replyMessage(event.replyToken, { type: 'text', text: replyText });
            } catch (err) {
              console.error('Drive upload error:', err);
              return Promise.resolve(null);
            }
          })
          .catch((err) => {
            console.error('getMessageContent error:', err);
            return Promise.resolve(null);
          });
      }
    }
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
