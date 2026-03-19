const express = require('express');
const app = express();
app.use(express.json());

const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');

// สร้างตัวจำลอง Token ป้องกัน Server Error
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "ไม่ได้ส่ง Token มาด้วย" });
    }
    next();
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
          type:          'http',
          scheme:        'bearer',
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
              description: 'แก้ไข Login Response description โดย ฐิติกาญจน์ รัตนะเอี่ยม',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user: {
              type: 'object',
              properties: {
                id:       { type: 'integer', example: 1 },
                username: { type: 'string',  example: 'admin' },
                role:     { type: 'string',  enum: ['admin', 'user'], example: 'admin' }
              }
            }
          }
        }
      },
    },
  },
  apis: ['./backend/server.js', './server.js'], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// =================================================================
// API Endpoints
// =================================================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    time:   new Date().toISOString()
  });
});

app.post('/api/login', (req, res) => { 
  res.status(200).json({ 
    token: "eyJhbGciOiJIUzI1...", 
    user: { id: 1, username: "admin", role: "admin" } 
  }); 
});

// ─────────────────────────────────────────────────────────────
// ✅ ส่วนที่เพิ่มใหม่ 1: API สำหรับ CheckIn (Mockup)
// ออกแบบโดย: ฐิติกาญจน์ รัตนะเอี่ยม (รหัสนักศึกษา: 68030071)
// ─────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/bookings/{id}/checkin:
 * post:
 * summary: เช็คอินการจอง
 * tags: [Bookings]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: OK
 */
app.post('/api/bookings/:id/checkin', (req, res) => {
    res.status(200).json({
        message: "Check-in successful",
        bookingId: parseInt(req.params.id),
        checkinTime: new Date().toISOString(),
        status: "confirmed",
        updatedBy: "ฐิติกาญจน์ รัตนะเอี่ยม (68030071)"
    });
});

// ─────────────────────────────────────────────────────────────
// ✅ ส่วนที่เพิ่มใหม่ 2: API สำหรับ CheckOut (Mockup)
// ออกแบบโดย: ฐิติกาญจน์ รัตนะเอี่ยม (รหัสนักศึกษา: 68030071)
// ─────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/bookings/{id}/checkout:
 * post:
 * summary: เช็คเอาท์การจอง
 * tags: [Bookings]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: OK
 */
app.post('/api/bookings/:id/checkout', (req, res) => {
    res.status(200).json({
        message: "Check-out completed successfully",
        bookingId: parseInt(req.params.id),
        checkoutTime: new Date().toISOString(),
        stayDuration: "2 Nights",
        totalAmount: 3500.00,
        currency: "THB",
        paymentStatus: "Paid",
        updatedBy: "ฐิติกาญจน์ รัตนะเอี่ยม (68030071)"
    });
});

// ─────────────────────────────────────────────────────────────
// ✅ ส่วนที่เพิ่มใหม่ 3: API สำหรับ ConfirmCheckOut (Mockup)
// ออกแบบโดย: ฐิติกาญจน์ รัตนะเอี่ยม (รหัสนักศึกษา: 68030071)
// ─────────────────────────────────────────────────────────────
/**
 * @swagger
 * /api/bookings/{id}/confirm-checkout:
 * post:
 * summary: ยืนยันการเช็คเอาท์
 * tags: [Bookings]
 * parameters:
 * - in: path
 * name: id
 * required: true
 * schema:
 * type: integer
 * responses:
 * 200:
 * description: OK
 */
app.post('/api/bookings/:id/confirm-checkout', (req, res) => {
    res.status(200).json({
        status: "success",
        message: "Payment confirmed and Check-out finalized",
        transactionId: "TXN-" + Date.now(),
        bookingId: parseInt(req.params.id),
        confirmedAt: new Date().toISOString(),
        confirmedBy: "ฐิติกาญจน์ รัตนะเอี่ยม (68030071)"
    });
});
// ─────────────────────────────────────────────────────────────

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📄 Swagger UI: http://localhost:${PORT}/api-docs`);
});