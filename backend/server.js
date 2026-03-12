const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')

const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const app = express()
app.use(cors())
app.use(express.json())

const PORT = 3001
const SECRET = "lab-secret"

/* ---------------- MOCK DATA ---------------- */

let bookings = []

const users = [
  { id: 1, username: "admin", password: "admin123", role: "admin" }
]

/* ---------------- AUTH MIDDLEWARE ---------------- */

function authenticateToken(req,res,next){

  const authHeader = req.headers['authorization']

  if(!authHeader){
    return res.status(401).json({ error:"กรุณาเข้าสู่ระบบก่อน" })
  }

  const token = authHeader.split(" ")[1]

  jwt.verify(token, SECRET, (err,user)=>{

    if(err){
      return res.status(403).json({ error:"Token ไม่ถูกต้องหรือหมดอายุ" })
    }

    req.user = user
    next()

  })

}

/* ─────────────────────────────────────────────────────────────────── */
/* Swagger / OpenAPI Configuration                                      */
/* ─────────────────────────────────────────────────────────────────── */

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
              description: 'แก้ไข Login Response description โดย ณภัทร สิงห์ตุ้ย 080'
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
        },
      },
    },
  },
  apis: ['./server.js']
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

console.log('📄 Swagger UI: http://localhost:3001/api-docs')

/* ─────────────────────────────────────────────────────────────────── */
/* POST /api/login — เข้าสู่ระบบ                                           */
/* ─────────────────────────────────────────────────────────────────── */

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
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: ไม่ได้ส่ง username หรือ password
 *       401:
 *         description: ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
 */
app.post('/api/login',(req,res)=>{

  const {username,password} = req.body

  if(!username || !password){
    return res.status(400).json({error:"กรุณาส่ง username และ password"})
  }

  const user = users.find(
    u=>u.username===username && u.password===password
  )

  if(!user){
    return res.status(401).json({error:"ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"})
  }

  const token = jwt.sign(
    { id:user.id, role:user.role },
    SECRET,
    { expiresIn:'1h' }
  )

  res.json({
    token,
    user:{
      id:user.id,
      username:user.username,
      role:user.role
    }
  })

})

/* ─────────────────────────────────────────────────────────────────── */
/* POST /api/bookings — สร้างการจองใหม่                                    */
/* ─────────────────────────────────────────────────────────────────── */

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
app.post('/api/bookings',(req,res)=>{

  const booking = {
    id: bookings.length + 1,
    ...req.body,
    status:"pending",
    created_at:new Date()
  }

  bookings.push(booking)

  res.status(201).json(booking)

})

/* ─────────────────────────────────────────────────────────────────── */
/* GET /api/bookings — ดึงข้อมูลการจองทั้งหมด                             */
/* ─────────────────────────────────────────────────────────────────── */

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
app.get('/api/bookings', authenticateToken,(req,res)=>{
  res.json(bookings)
})

/* ─────────────────────────────────────────────────────────────────── */
/* GET /api/bookings/:id — ดึงข้อมูลการจองตาม ID                       */
/* ─────────────────────────────────────────────────────────────────── */

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
 *       403:
 *         description: Token ไม่ถูกต้องหรือหมดอายุ
 *       404:
 *         description: ไม่พบข้อมูลการจอง
 */
app.get('/api/bookings/:id', authenticateToken,(req,res)=>{
  const booking = bookings.find(b => b.id === parseInt(req.params.id))
  
  if(!booking){
    return res.status(404).json({error:"ไม่พบข้อมูลการจอง"})
  }
  
  res.json(booking)
})

/* ─────────────────────────────────────────────────────────────────── */
/* PUT /api/bookings/:id — แก้ไขข้อมูลการจอง                            */
/* ─────────────────────────────────────────────────────────────────── */

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
 *       403:
 *         description: Token ไม่ถูกต้องหรือหมดอายุ
 *       404:
 *         description: ไม่พบข้อมูลการจอง
 */
app.put('/api/bookings/:id', authenticateToken,(req,res)=>{
  const booking = bookings.find(b => b.id === parseInt(req.params.id))
  
  if(!booking){
    return res.status(404).json({error:"ไม่พบข้อมูลการจอง"})
  }
  
  Object.assign(booking, req.body)
  
  res.json(booking)
})

/* ─────────────────────────────────────────────────────────────────── */
/* DELETE /api/bookings/:id — ลบข้อมูลการจอง                            */
/* ─────────────────────────────────────────────────────────────────── */

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
 *       403:
 *         description: Token ไม่ถูกต้องหรือหมดอายุ
 *       404:
 *         description: ไม่พบข้อมูลการจอง
 */
app.delete('/api/bookings/:id', authenticateToken,(req,res)=>{
  const index = bookings.findIndex(b => b.id === parseInt(req.params.id))
  
  if(index === -1){
    return res.status(404).json({error:"ไม่พบข้อมูลการจอง"})
  }
  
  const deletedBooking = bookings.splice(index, 1)
  
  res.json({
    message:"ลบข้อมูลสำเร็จ",
    id: req.params.id
  })
})

/* ─────────────────────────────────────────────────────────────────── */
/* GET /api/health — ตรวจสอบสถานะ Server                               */
/* ─────────────────────────────────────────────────────────────────── */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: ตรวจสอบสถานะของ Server
 *     description: ใช้สำหรับ Health Check — ไม่ต้องการ Authentication
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server ทำงานปกติ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:  { type: string,  example: ok }
 *                 uptime:  { type: number,  example: 120.5 }
 *                 time:    { type: string,  example: '2026-01-01T00:00:00.000Z' }
 */
app.get('/api/health',(req,res)=>{

  res.json({
    status:'ok',
    uptime:process.uptime(),
    time:new Date().toISOString()
  })

})

/* ─────────────────────────────────────────────────────────────────── */
/* START SERVER                                                        */
/* ─────────────────────────────────────────────────────────────────── */

app.listen(PORT,()=>{
  console.log("Server running on port",PORT)
})
/* ─────────────────────────────────────────────────────────────────── */
/* POST /api/checkin — ทำการ CheckIn                                   */
/* ─────────────────────────────────────────────────────────────────── */

/**
 * @swagger
 * /api/checkin:
 *   post:
 *     summary: ทำการ CheckIn
 *     tags: [CheckIn]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: CheckIn สำเร็จ
 */

 // เพิ่ม API โดย ณภัทร สิงห์ตุ้ย 60830080

app.post('/api/checkin', authenticateToken,(req,res)=>{

  const { bookingId } = req.body

  const booking = bookings.find(
    b => b.id === parseInt(bookingId)
  )

  if(!booking){
    return res.status(404).json({error:"ไม่พบ booking"})
  }

  const checkinData = {
    checkinId: Date.now(),
    bookingId: bookingId,
    guestName: booking.fullname,
    room:"A101",
    status:"checked-in",
    time:new Date()
  }

  res.json({
    message:"CheckIn สำเร็จ",
    data:checkinData
  })

})
/* ─────────────────────────────────────────────────────────────────── */
/* POST /api/checkout — ทำการ CheckOut                                 */
/* ─────────────────────────────────────────────────────────────────── */

/**
 * @swagger
 * /api/checkout:
 *   post:
 *     summary: ทำการ CheckOut
 *     tags: [CheckOut]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               checkinId:
 *                 type: integer
 *                 example: 1001
 *     responses:
 *       200:
 *         description: CheckOut สำเร็จ
 */

 // เพิ่ม API โดย ณภัทร สิงห์ตุ้ย 60830080

app.post('/api/checkout', authenticateToken,(req,res)=>{

  const { checkinId } = req.body

  const checkoutData = {
    checkoutId: Date.now(),
    checkinId: checkinId,
    checkoutTime:new Date(),
    totalPrice:2500
  }

  res.json({
    message:"CheckOut สำเร็จ",
    data:checkoutData
  })

})
/* ─────────────────────────────────────────────────────────────────── */
/* POST /api/confirm-checkout — ยืนยัน CheckOut                         */
/* ─────────────────────────────────────────────────────────────────── */

/**
 * @swagger
 * /api/confirm-checkout:
 *   post:
 *     summary: ยืนยันการ CheckOut
 *     tags: [CheckOut]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               checkoutId:
 *                 type: integer
 *                 example: 2001
 *     responses:
 *       200:
 *         description: Confirm สำเร็จ
 */

 // เพิ่ม API โดย ณภัทร สิงห์ตุ้ย 60830080

app.post('/api/confirm-checkout', authenticateToken,(req,res)=>{

  const { checkoutId } = req.body

  res.json({
    message:"Confirm CheckOut สำเร็จ",
    checkoutId:checkoutId,
    status:"completed",
    time:new Date()
  })

})