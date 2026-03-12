// create-newman-files.js
// รันด้วย: node create-newman-files.js
// ใช้ได้บน Windows, macOS, Linux ทุกเครื่องที่มี Node.js

const fs   = require('fs');
const path = require('path');

// สร้างโฟลเดอร์ newman และ reports ถ้ายังไม่มี
fs.mkdirSync('newman',  { recursive: true });
fs.mkdirSync('reports', { recursive: true });

// ─────────────────────────────────────────────────────────────
// 1. Environment — เก็บค่าตัวแปรที่ใช้ร่วมกันทุก Request
// ─────────────────────────────────────────────────────────────
const env = {
  id: 'hotel-booking-local-env',
  name: 'Hotel Booking - Local',
  values: [
    { key: 'baseUrl',   value: 'http://localhost:3001', type: 'default', enabled: true },
    { key: 'token',     value: '',                      type: 'default', enabled: true },
    { key: 'bookingId', value: '',                      type: 'default', enabled: true }
  ],
  _postman_variable_scope: 'environment'
};

// ─────────────────────────────────────────────────────────────
// 2. Collection — Requests พร้อม pm.test()
// ─────────────────────────────────────────────────────────────
const collection = {
  info: {
    name: 'Hotel Booking API Tests',
    description: 'Automated API Tests สำหรับ Hotel Booking System — Lab02A',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  item: [

    // ── Request 1: POST /api/login ───────────────────────────
    {
      name: '1. POST /api/login',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Status code is 200", function() {',
        '  pm.response.to.have.status(200);',
        '});',
        'pm.test("Response has token and user info", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d).to.have.property("token");',
        '  pm.expect(d.token).to.be.a("string").and.not.empty;',
        '  pm.expect(d.user).to.have.property("role", "admin");',
        '  pm.expect(d.user).to.not.have.property("password");',
        '  pm.environment.set("token", d.token);',
        '});',
        'pm.test("Response time is less than 2000ms", function() {',
        '  pm.expect(pm.response.responseTime).to.be.below(2000);',
        '});',
        'pm.test("user.id is a positive number", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d.user.id).to.be.a("number").and.above(0);',
        '});'
      ]}}],
      request: {
        method: 'POST',
        header: [{ key: 'Content-Type', value: 'application/json' }],
        body: { mode: 'raw', raw: JSON.stringify({ username: 'admin', password: 'admin123' }) },
        url: { raw: '{{baseUrl}}/api/login', host: ['{{baseUrl}}'], path: ['api','login'] }
      }
    },

    // ── Request 2: POST /api/bookings ────────────────────────
    {
      name: '2. POST /api/bookings',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Status code is 201 Created", function() {',
        '  pm.response.to.have.status(201);',
        '});',
        'pm.test("Has id and status defaults to pending", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d).to.have.property("id");',
        '  pm.expect(d.id).to.be.a("number").and.above(0);',
        '  pm.expect(d.status).to.equal("pending");',
        '  pm.environment.set("bookingId", d.id);',
        '});'
      ]}}],
      request: {
        method: 'POST',
        header: [{ key: 'Content-Type', value: 'application/json' }],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            fullname: 'ชื่อ ณภัทร สิงห์ตุ้ย',
            email: '68030080@mkitl.ac.th',
            phone: '0812345678',
            checkin: '2026-12-01',
            checkout: '2026-12-03',
            roomtype: 'standard',
            guests: 2
          })
        },
        url: { raw: '{{baseUrl}}/api/bookings', host: ['{{baseUrl}}'], path: ['api','bookings'] }
      }
    },

    // ── Request 3: GET /api/bookings (with token) ────────────
    {
      name: '3. GET /api/bookings (with token)',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Status code is 200", function() {',
        '  pm.response.to.have.status(200);',
        '});',
        'pm.test("Response is an array", function() {',
        '  pm.expect(pm.response.json()).to.be.an("array");',
        '});'
      ]}}],
      request: {
        method: 'GET',
        header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
        url: { raw: '{{baseUrl}}/api/bookings', host: ['{{baseUrl}}'], path: ['api','bookings'] }
      }
    },

    // ── Request 4: GET /api/bookings (NO token) ──────────────
    {
      name: '4. GET /api/bookings (NO token - Negative)',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Returns 401 without token", function() {',
        '  pm.response.to.have.status(401);',
        '});'
      ]}}],
      request: {
        method: 'GET',
        url: { raw: '{{baseUrl}}/api/bookings', host: ['{{baseUrl}}'], path: ['api','bookings'] }
      }
    },

    // ── Request 5: GET booking by id ─────────────────────────
    {
      name: '5. GET /api/bookings/:id',
      request: {
        method: 'GET',
        header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
        url: { raw: '{{baseUrl}}/api/bookings/{{bookingId}}', host: ['{{baseUrl}}'], path: ['api','bookings','{{bookingId}}'] }
      }
    },

    // ── Request 6: UPDATE booking ────────────────────────────
    {
      name: '6. PUT /api/bookings/:id',
      request: {
        method: 'PUT',
        header: [
          { key: 'Authorization', value: 'Bearer {{token}}' },
          { key: 'Content-Type', value: 'application/json' }
        ],
        body: {
          mode: 'raw',
          raw: JSON.stringify({
            fullname: 'นักศึกษา ทดสอบ Newman (Updated)',
            email: 'newman-updated@test.com',
            phone: '0898765432',
            checkin: '2026-12-01',
            checkout: '2026-12-05',
            roomtype: 'deluxe',
            guests: 3,
            comment: 'Updated by Newman test'
          })
        },
        url: { raw: '{{baseUrl}}/api/bookings/{{bookingId}}', host: ['{{baseUrl}}'], path: ['api','bookings','{{bookingId}}'] }
      }
    },

    // ── Request 7: DELETE booking ────────────────────────────
    {
      name: '7. DELETE /api/bookings/:id',
      request: {
        method: 'DELETE',
        header: [{ key: 'Authorization', value: 'Bearer {{token}}' }],
        url: { raw: '{{baseUrl}}/api/bookings/{{bookingId}}', host: ['{{baseUrl}}'], path: ['api','bookings','{{bookingId}}'] }
      }
    },

    // ── Request 8: Negative Test ─────────────────────────────
    {
      name: '8. POST /api/login — Wrong Password',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: [
        'pm.test("Status code is 401", function() {',
        '  pm.response.to.have.status(401);',
        '});',
        'pm.test("Response has error message", function() {',
        '  const d = pm.response.json();',
        '  pm.expect(d).to.have.property("error");',
        '});'
      ]}}],
      request: {
        method: 'POST',
        header: [{ key: 'Content-Type', value: 'application/json' }],
        body: { mode: 'raw', raw: JSON.stringify({ username: 'admin', password: 'wrongpassword' }) },
        url: { raw: '{{baseUrl}}/api/login', host: ['{{baseUrl}}'], path: ['api','login'] }
      }
    }

  ]
};

// ─────────────────────────────────────────────────────────────
// 3. เขียนไฟล์
// ─────────────────────────────────────────────────────────────
fs.writeFileSync(
  path.join('newman','hotel-booking-env.json'),
  JSON.stringify(env,null,2),
  'utf8'
);

fs.writeFileSync(
  path.join('newman','hotel-booking-collection.json'),
  JSON.stringify(collection,null,2),
  'utf8'
);

console.log('✅ สร้างไฟล์ Newman สำเร็จ');