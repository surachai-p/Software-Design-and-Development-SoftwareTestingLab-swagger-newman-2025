const express = require('express');
const app = express(); // 👈 ต้องมีบรรทัดนี้
const jwt = require('jsonwebtoken');
const SECRET_KEY = '68030072'; 

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'ไม่ได้ส่ง Token' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token ไม่ถูกต้อง' });
    req.user = user;
    next();
  });
}


app.use((req, res, next) => {
  next(); // 👈 ต้องมี!
});

app.use(express.json());

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


// ─────────────────────────────────────────────────────────────
// Swagger / OpenAPI Configuration
// ─────────────────────────────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'Hotel Booking API',
      version:     '1.0.0',
      description: 'REST API สำหรับระบบจองห้องพักออนไลน์ — ใบงาน Lab02A',
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Development Server' }
    ],
    components: {
      // Security Scheme — บอก Swagger ว่า API ใช้ Bearer JWT
      securitySchemes: {
        bearerAuth: {
          type:         'http',
          scheme:       'bearer',
          bearerFormat: 'JWT',
        },
      },
      // Schema — โครงสร้างข้อมูลที่ใช้ซ้ำใน Request/Response
      schemas: {
        Booking: {
          type: 'object',
          required: ['fullname', 'email', 'phone', 'checkin', 'checkout', 'roomtype', 'guests'],
          properties: {
            id:         { type: 'integer', example: 1 },
            fullname:   { type: 'string',  example: 'สมชาย ใจดี' },
            email:      { type: 'string',  format: 'email', example: 'somchai@example.com' },
            phone:      { type: 'string',  example: '0812345678' },
            checkin:    { type: 'string',  format: 'date',  example: '2026-12-01' },
            checkout:   { type: 'string',  format: 'date',  example: '2026-12-03' },
            roomtype:   { type: 'string',  enum: ['standard', 'deluxe', 'suite'], example: 'standard' },
            guests:     { type: 'integer', minimum: 1, maximum: 4, example: 2 },
            status:     { type: 'string',  example: 'pending' },
            comment:    { type: 'string',  example: 'ต้องการห้องชั้นล่าง' },
            created_at: { type: 'string',  example: '2026-01-01T00:00:00.000Z' },
          },
        },
      },
    },
  },
  // บอก swagger-jsdoc ให้อ่าน @swagger comment จากไฟล์เหล่านี้
  apis: ['./server.js'],
};

// สร้าง OpenAPI spec จาก options และ @swagger comments ในไฟล์
const swaggerSpec = swaggerJsdoc(swaggerOptions);



// Mount Swagger UI ที่ path /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

console.log('📄 Swagger UI: http://localhost:3001/api-docs');

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: เข้าสู่ระบบ
 *     description: ตรวจสอบ username/password และคืนค่า JWT Token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ — คืน JWT Token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:       { type: integer, example: 1 }
 *                     username: { type: string,  example: admin }
 *                     role:     { type: string,  example: admin }
 *       400:
 *         description: ไม่ได้ส่ง username หรือ password
 *       401:
 *         description: ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
 */
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // mock user
  if (username === 'admin' && password === 'admin123') {
    const user = { id: 1, username: 'admin', role: 'admin' };

    const token = jwt.sign(user, SECRET_KEY, { expiresIn: '1h' });

    return res.json({
      token,
      user
    });
  }

  res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
});

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: สร้างการจองใหม่
 *     description: สร้างข้อมูลการจองห้องพัก — ไม่ต้องการ Authentication
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       201:
 *         description: สร้างการจองสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       400:
 *         description: ข้อมูลไม่ครบถ้วน
 */
app.post('/api/bookings', (req, res) => { /* โค้ดเดิม */ });

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: ดึงข้อมูลการจองทั้งหมด
 *     description: ต้องการ JWT Token — กด Authorize ที่มุมบนขวาก่อนทดลองใช้
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการการจองทั้งหมด เรียงจากใหม่ไปเก่า
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       401:
 *         description: ไม่ได้ส่ง Token
 *       403:
 *         description: Token ไม่ถูกต้องหรือหมดอายุ
 */
app.get('/api/bookings', (req, res) => { /* โค้ดเดิม */ });

/**
 * @swagger
 * /api/bookings/{id}:
 *   get:
 *     summary: ดึงข้อมูลการจองตาม ID
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID ของการจอง
 *         example: 1
 *     responses:
 *       200:
 *         description: ข้อมูลการจอง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       401:
 *         description: ไม่ได้ส่ง Token
 *       404:
 *         description: ไม่พบข้อมูลการจอง
 */
app.get('/api/bookings/:id',authenticateToken,(req, res) => { /* โค้ดเดิม */ });

/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     summary: แก้ไขข้อมูลการจอง
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Booking'
 *     responses:
 *       200:
 *         description: แก้ไขสำเร็จ คืนข้อมูลที่อัปเดตแล้ว
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       401:
 *         description: ไม่ได้ส่ง Token
 *       404:
 *         description: ไม่พบข้อมูลการจอง
 */
app.put('/api/bookings/:id', authenticateToken,  (req, res) => { /* โค้ดเดิม */ });

/**
 * @swagger
 * /api/bookings/{id}:
 *   delete:
 *     summary: ลบข้อมูลการจอง
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: ลบสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string, example: ลบข้อมูลสำเร็จ }
 *                 id:      { type: string, example: "1" }
 *       401:
 *         description: ไม่ได้ส่ง Token
 *       404:
 *         description: ไม่พบข้อมูลการจอง
 */
app.delete('/api/bookings/:id', authenticateToken, (req, res) => { /* โค้ดเดิม */ });

app.listen(3001, () => {
  console.log('Server running on port 3001');
});



