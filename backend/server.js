const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');

const app = express();
const PORT = 3005;

app.use(express.json());

// --- 1. Middleware สำหรับตรวจสอบ Token ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: "ต้องเข้าสู่ระบบก่อน" });
  next();
};

// --- 2. Swagger Configuration (แก้ไขสำหรับข้อ 4) ---
// ส่วนนี้จะทำให้หน้าเว็บ http://localhost:3005/api-docs แสดงชื่อของคุณ
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hotel Booking API - Lab Test',
      version: '1.0.0',
      description: 'ระบบจัดการโรงแรม พัฒนาโดย สุณัฐชา (68030298)'
    },
    servers: [{ url: `http://localhost:${PORT}` }],
  },
  apis: ['./server.js'], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- 3. API Login (ของเดิม) ---
app.post('/api/login', (req, res) => {
  res.json({ 
    token: "eyJhbGciOiJIUzI1NiJ9.normal-valid-token-1h-session",
    user: { id: 1, username: "admin", role: "admin" }
  });
});

// ==========================================
// แบบทดสอบ ข้อ 1: API สำหรับ CheckIn 
// สร้างโดย สุณัฐชา (68030298)
// ==========================================
app.post('/api/checkin/:bookingId', (req, res) => {
    const { bookingId } = req.params;
    res.status(200).json({
        message: "Check-in successful",
        checkInId: "CI-68030298-" + Math.floor(Math.random() * 1000),
        bookingId: bookingId,
        status: "Checked In",
        checkInTime: new Date().toISOString(),
        staff: "สุณัฐชา (68030298)"
    });
});

// ==========================================
// แบบทดสอบ ข้อ 2: API สำหรับ CheckOut 
// สร้างโดย สุณัฐชา (68030298)
// ==========================================
app.post('/api/checkout/:checkInId', (req, res) => {
    const { checkInId } = req.params;
    res.status(200).json({
        message: "Check-out summary generated",
        checkInId: checkInId,
        roomCharge: 2000,
        serviceCharge: 500,
        totalAmount: 2500,
        status: "Pending Confirmation",
        processedBy: "สุณัฐชา (68030298)"
    });
});

// ==========================================
// แบบทดสอบ ข้อ 3: API สำหรับ ConfirmCheckOut 
// สร้างโดย สุณัฐชา (68030298)
// ==========================================
app.post('/api/confirm-checkout', (req, res) => {
    res.status(200).json({
        message: "Check-out confirmed",
        paymentStatus: "Paid",
        receiptNo: "RCP-68030298-" + Date.now(),
        status: "Closed",
        confirmedBy: "สุณัฐชา (68030298)"
    });
});

app.listen(PORT, () => {
  console.log(`🚀 SERVER READY ON PORT ${PORT}`);
  console.log(`📖 Swagger UI: http://localhost:${PORT}/api-docs`);
});