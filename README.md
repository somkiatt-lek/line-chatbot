# LINE Chatbot

โปรเจกต์ตัวอย่างสำหรับสร้าง LINE chatbot ด้วย Node.js และ Render

## ขั้นตอนเริ่มต้น

1. ติดตั้ง dependencies

```bash
npm install
```

2. ตั้งค่าตัวแปร environment

- `LINE_CHANNEL_SECRET`
- `LINE_CHANNEL_ACCESS_TOKEN`

ถ้าใช้ Render ให้เพิ่มค่าตัวแปรเหล่านี้ใน Dashboard ของ Render

3. รันเซิร์ฟเวอร์

```bash
npm start
```

4. ตั้งค่า Webhook URL ใน LINE Developer Console

ถ้ารันที่เครื่อง local ให้ใช้ ngrok เช่น:

```bash
gnrok http 3000
```

แล้วตั้ง Webhook URL เป็น:

```
https://<your-ngrok-id>.ngrok.io/webhook
```

ถ้า deploy บน Render ให้ตั้งเป็น:

```
https://<your-app>.onrender.com/webhook
```

## รูปแบบการตอบกลับ

โค้ดตัวอย่างจะตอบข้อความกลับเป็น:

`คุณพิมพ์ว่า: <ข้อความที่ผู้ใช้ส่ง>`

## Deploy บน Render

1. สร้าง GitHub repository
2. เชื่อม Render กับ GitHub
3. เลือก repo นี้ และสร้าง Web Service
4. ตั้ง `Build Command` เป็น `npm install`
5. ตั้ง `Start Command` เป็น `npm start`
6. ตั้งค่าตัวแปร environment ที่ Render

---

ถ้าต้องการให้ช่วยเขียน webhook ให้รองรับข้อความแบบอื่นหรือใช้ template message เพิ่ม บอกได้เลยครับ
