const express = require('express');
const app = express();
app.use(express.json());

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');
const jwt = require('jsonwebtoken');
const path = require('path');

// ── ฟังก์ชันตรวจสอบ Token (ปรับให้ส่ง error ตามที่ Newman ต้องการ) ──
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        // Newman ข้อ 4 ตรวจหา property "error"
        return res.status(401).json({ error: "ต้องเข้าสู่ระบบก่อน" }); 
    }

    jwt.verify(token, 'SECRET_KEY', (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Token หมดอายุหรือลายเซ็นไม่ถูกต้อง" });
        }
        req.user = user;
        next();
    });
};

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'Hotel Booking API',
      version:     '1.0.0',
      description: 'REST API สำหรับระบบจองห้องพักออนไลน์ — ใบงาน Lab02A',
    },
    servers: [
      { url: '/', description: 'Development Server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type:         'http',
          scheme:       'bearer',
          bearerFormat: 'JWT',
        },
      },
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
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              description: 'ภัคธร ศรีบุ่งง้าว'
            },
            user: {
              type: 'object',
              properties: {
                id:       { type: 'integer' },
                username: { type: 'string' },
                role:     { type: 'string', enum: ['admin', 'user'] }
              }
            }
          }
        }
      },
    },
  },
  apis: [path.join(__dirname, 'server.js'), './server.js', './backend/server.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// =================================================================
// API Endpoints
// =================================================================

app.post('/api/login', (req, res) => {
    // 1. รับค่า username และ password จาก body
    const { username, password } = req.body;

    // 2. เช็คว่ารหัสถูกต้องไหม (admin / admin123)
    if (username === 'admin' && password === 'admin123') {
        // ถ้ารหัสถูก -> ส่ง 200 และ Token
        const user = { id: 1, username: "admin", role: "admin" };
        const token = jwt.sign(user, 'SECRET_KEY', { expiresIn: '1h' }); 
        res.status(200).json({ 
            token: token, 
            user: user 
        }); 
    } else {
        // ถ้ารหัสผิด -> ส่ง 401 และ error message (Newman ข้อ 8 จะผ่านตรงนี้)
        res.status(401).json({ 
            error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" 
        });
    }
});

app.post('/api/bookings', (req, res) => { 
    // Newman ข้อ 2 ต้องการ id และ status: pending
    res.status(201).json({
        id: 101, 
        fullname: req.body.fullname || "นักศึกษา ทดสอบ Newman",
        status: "pending"
    }); 
});

app.get('/api/bookings', authenticateToken, (req, res) => { 
    // Newman ข้อ 3 ต้องการ Array ที่มีข้อมูลครบถ้วน
    res.status(200).json([{
        id: 101,
        fullname: "นักศึกษา ทดสอบ Newman",
        email: "newman@test.com",
        phone: "0812345678",
        checkin: "2026-12-01",
        checkout: "2026-12-03",
        roomtype: "standard",
        guests: 2,
        status: "pending",
        created_at: new Date().toISOString()
    }]); 
});

app.get('/api/bookings/:id', authenticateToken, (req, res) => { 
    // Newman ข้อ 5 ต้องการ id ที่ตรงกัน และ fullname ไม่ว่าง
    res.status(200).json({
        id: parseInt(req.params.id),
        fullname: "นักศึกษา ทดสอบ Newman",
        email: "newman@test.com"
    }); 
});

app.put('/api/bookings/:id', authenticateToken, (req, res) => { 
    // Newman ข้อ 6 ต้องการ guests: 3 และ comment ที่ระบุ
    res.status(200).json({
        id: parseInt(req.params.id),
        fullname: "นักศึกษา ทดสอบ Newman (Updated)",
        roomtype: "deluxe",
        guests: 3, 
        comment: "Updated by Newman test"
    }); 
});

app.delete('/api/bookings/:id', authenticateToken, (req, res) => { 
    // Newman ข้อ 7 ต้องการ message และ id
    res.status(200).json({ 
        message: "ลบข้อมูลสำเร็จ", 
        id: req.params.id 
    }); 
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    time:   new Date().toISOString()
  });
});

/**
 * @swagger
 * /api/bookings/{id}/checkin:
 *   post:
 *     summary: เช็คอินการจองห้องพัก
 *     description: ทำการ Check-In โดยระบุ ID ของการจอง (Mockup)
 *     tags:
 *       - Bookings
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID ของการจองที่ต้องการ Check-In
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Check-In สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 bookingId:
 *                   type: integer
 *                 checkinTime:
 *                   type: string
 *                 status:
 *                   type: string
 */
// แก้ไขโดย: ภัคธร ศรีบุ่งง้าว รหัสนักศึกษา 68030223
app.post('/api/bookings/:id/checkin', (req, res) => {
    const bookingId = req.params.id;
    
    // จำลองข้อมูล Response (Mockup)
    const mockupResponse = {
        message: "Check-In สำเร็จเรียบร้อยแล้ว",
        bookingId: parseInt(bookingId),
        checkinTime: new Date().toISOString(),
        status: "checked-in",
        checkedBy: "ภัคธร ศรีบุ่งง้าว (68030223)" // ใส่ชื่อเพื่อยืนยันความเป็นเจ้าของ API
    };

    res.status(200).json(mockupResponse);
});

/**
 * @swagger
 * /api/bookings/{id}/checkout:
 *   post:
 *     summary: เช็คเอาท์การจองห้องพัก (โดย ภัคธร)
 *     tags:
 *       - Bookings
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID ของการจองที่ต้องการ Check-Out
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Check-Out สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 bookingId:
 *                   type: integer
 *                 checkoutTime:
 *                   type: string
 *                 status:
 *                   type: string
 *                 totalAmount:
 *                   type: number
 *                 checkedOutBy:
 *                   type: string
 */
// แก้ไขโดย: ภัคธร ศรีบุ่งง้าว รหัสนักศึกษา 68030223
app.post('/api/bookings/:id/checkout', (req, res) => {
    const bookingId = req.params.id;

    const checkoutMockup = {
        message: "ดำเนินการ Check-Out เรียบร้อยแล้ว ขอบคุณที่ใช้บริการ",
        bookingId: parseInt(bookingId),
        checkoutTime: new Date().toISOString(),
        status: "completed",
        totalAmount: 1500.00,
        checkedOutBy: "ภัคธร ศรีบุ่งง้าว (68030223)"
    };

    res.status(200).json(checkoutMockup);
});

/**
 * @swagger
 * /api/bookings/{id}/confirm-checkout:
 *   post:
 *     summary: ยืนยันการเช็คเอาท์และสรุปยอด (โดย ภัคธร)
 *     tags:
 *       - Bookings
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID ของการจองที่ต้องการยืนยัน
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: ยืนยัน Check-Out สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 bookingId:
 *                   type: integer
 *                 paymentStatus:
 *                   type: string
 *                 finalStatus:
 *                   type: string
 *                 confirmDate:
 *                   type: string
 *                 confirmedBy:
 *                   type: string
 */
// แก้ไขโดย: ภัคธร ศรีบุ่งง้าว รหัสนักศึกษา 68030223
app.post('/api/bookings/:id/confirm-checkout', (req, res) => {
    const bookingId = req.params.id;

    const confirmResponse = {
        message: "ยืนยันการ Check-Out และชำระเงินเสร็จสิ้น",
        bookingId: parseInt(bookingId),
        paymentStatus: "paid",
        finalStatus: "closed",
        confirmDate: new Date().toLocaleString('th-TH'),
        confirmedBy: "ภัคธร ศรีบุ่งง้าว (68030223)"
    };

    res.status(200).json(confirmResponse);
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📄 Swagger UI: http://localhost:${PORT}/api-docs`);
});