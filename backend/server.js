// backend/server.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// 1. ตัวแกะข้อมูล JSON (Body Parsing) เผื่อหน้าบ้านยิงส่งข้อมูลมา [cite: 32, 33]
app.use(express.json());

// 2. 🌟 หัวใจสำคัญ: สั่งให้ Node เสิร์ฟไฟล์จากโฟลเดอร์ frontend ที่อยู่ข้าง ๆ
// path.join จะช่วยวิ่งออกจากโฟลเดอร์ backend แล้วเดินเข้าโฟลเดอร์ frontend ให้โดยอัตโนมัติ
app.use(express.static(path.join(__dirname, '../frontend')));

// 3. เปิดพอร์ตและรันระบบ Live Server
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 TurnPro Live Server กำลังทำงานแล้วครับแบงค์!`);
    console.log(`💻 ลองเข้าใช้งานหน้าเว็บได้ที่: http://localhost:${PORT}`);
    console.log(`=======================================================`);
});