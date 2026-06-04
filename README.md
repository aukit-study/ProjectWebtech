# Webtech E-Learning Platform (TurnPro)

แพลตฟอร์มคอร์สเรียนออนไลน์แบบ Full-Stack ที่สมบูรณ์แบบ รองรับการสมัครสมาชิก การซื้อคอร์สเรียน การเข้าเรียนในห้องเรียนออนไลน์ (Classroom) และระบบหลังบ้านสำหรับผู้ดูแลระบบ (Admin)

## 🌟 ฟีเจอร์หลัก (Key Features)

- **ระบบสมาชิก (Authentication):** สมัครสมาชิกและเข้าสู่ระบบด้วย JWT Token ความปลอดภัยสูง
- **คลังคอร์สเรียน (Course Catalog):** ระบบค้นหาและตัวกรองคอร์สเรียน (ตามหมวดหมู่และราคา)
- **ระบบตะกร้าสินค้า (Shopping Cart):** รองรับการซื้อคอร์สทีละหลายคอร์ส พร้อมระบบคำนวณส่วนลดอัตโนมัติ (เช่น ซื้อครบ 3 คอร์ส ลด 10%)
- **ห้องเรียนส่วนตัว (My Classroom):** ติดตามความก้าวหน้าการเรียน (Progress Bar) และแสดงเนื้อหาบทเรียนย่อย
- **ระบบผู้ดูแลระบบ (Admin Dashboard):** หน้าสำหรับ Admin ในการเพิ่ม/ลบ/แก้ไขข้อมูลคอร์สเรียน จำนวนที่นั่ง และบทเรียน (CRUD Operations)

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### Frontend (หน้าบ้าน)
- **HTML5 & CSS3 (Vanilla):** เขียน UI ด้วยตัวเองทั้งหมด ไม่พึ่งพา Framework หนักๆ ทำให้โหลดเร็วและสามารถปรับแต่งได้อิสระ
- **JavaScript (ES6+):** จัดการ State และเชื่อมต่อ API
- **FontAwesome:** ไอคอนตกแต่งหน้าเว็บ

### Backend (หลังบ้าน)
- **Node.js & Express.js:** สร้าง RESTful API สื่อสารกับ Frontend
- **SQLite3:** ฐานข้อมูลแบบไฟล์ในตัว (Local Database) ใช้งานง่าย ไม่ต้องติดตั้ง Database Server แยก
- **JWT (JSON Web Token):** จัดการสิทธิ์และการยืนยันตัวตนของผู้ใช้งาน

## 🚀 วิธีติดตั้งและรันโปรเจกต์ (How to Run)

เนื่องจากโปรเจกต์นี้ได้รับการอัปเกรดให้มีระบบ Backend ฐานข้อมูลจริง **จึงไม่สามารถดับเบิลคลิกเปิดไฟล์ HTML ตรงๆ ได้อีกต่อไป** กรุณาทำตามขั้นตอนด้านล่างนี้:

1. **ติดตั้ง Node.js:** ตรวจสอบว่าในเครื่องมี Node.js ติดตั้งอยู่ (ดาวน์โหลดได้ที่ [nodejs.org](https://nodejs.org/))
2. **เปิด Terminal (หรือ Command Prompt)** และเข้าไปที่โฟลเดอร์ `backend` ของโปรเจกต์
   ```bash
   cd backend
   ```
3. **ติดตั้ง Dependencies:**
   ```bash
   npm install
   ```
4. **เริ่มการทำงานของ Server:**
   ```bash
   npm start
   ```
   *(หรือใช้คำสั่ง `node server.js`)*
5. **เข้าใช้งานเว็บไซต์:** เปิดเว็บเบราว์เซอร์และเข้าไปที่ URL:
   👉 **http://localhost:5000**

*(ระบบจะทำการเสิร์ฟไฟล์ Frontend และเชื่อมต่อ Database ให้อัตโนมัติ)*

## 📂 โครงสร้างโฟลเดอร์ (Folder Structure)

```text
TurnPro/ProjectWebtech/
├── backend/                  # ระบบหลังบ้าน (API & Database)
│   ├── database.sqlite       # ไฟล์ฐานข้อมูล SQLite (สร้างอัตโนมัติ)
│   ├── server.js             # ไฟล์หลักในการรัน Server
│   ├── src/
│   │   ├── config/           # ตั้งค่า Database และ Schema
│   │   ├── controllers/      # ควบคุม Request/Response 
│   │   ├── middleware/       # ตัวกรอง เช่น ตรวจสอบ JWT
│   │   ├── routes/           # เส้นทาง API (Endpoints)
│   │   └── services/         # ประมวลผล Logic และคำสั่ง SQL
├── frontend/                 # ระบบหน้าบ้าน (UI)
│   ├── index.html            # หน้าแรก (คลังคอร์ส)
│   ├── login.html            # หน้าเข้าสู่ระบบ
│   ├── classroom.html        # หน้าห้องเรียน
│   ├── admin.html            # หน้าจัดการระบบ
│   ├── profile.html          # หน้าโปรไฟล์ผู้ใช้
│   ├── css/                  # สไตล์ไฟล์ CSS
│   └── js/                   # ไฟล์สคริปต์ (main.js, admin.js, ฯลฯ)
└── README.md                 # เอกสารอธิบายโปรเจกต์
```

## 👥 บัญชีทดสอบ (Mock Users)
ระบบจะสร้างบัญชีเริ่มต้นให้เมื่อรันฐานข้อมูลครั้งแรก:
- **แอดมิน (Admin):** Username: `admin1` / Password: `admin1`
- **ผู้ใช้งานทั่วไป (Student):** Username: `student1` / Password: `student1`
