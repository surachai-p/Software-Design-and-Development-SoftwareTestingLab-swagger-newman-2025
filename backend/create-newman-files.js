const fs = require('fs');
const path = require('path');

const collection = {
  info: {
    name: 'Final Lab Test Summary - สุณัฐชา 68030298',
    schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
  },
  item: [
    {
      name: '1. CheckIn',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: ['pm.test("Status 200", () => pm.response.to.have.status(200));'] } }],
      request: { method: 'POST', url: { raw: 'http://localhost:3005/api/checkin/BK-999', protocol: 'http', host: ['localhost'], port: '3005', path: ['api', 'checkin', 'BK-999'] } }
    },
    {
      name: '2. CheckOut',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: ['pm.test("Status 200", () => pm.response.to.have.status(200));'] } }],
      request: { method: 'POST', url: { raw: 'http://localhost:3005/api/checkout/CI-999', protocol: 'http', host: ['localhost'], port: '3005', path: ['api', 'checkout', 'CI-999'] } }
    },
    {
      name: '3. Confirm',
      event: [{ listen: 'test', script: { type: 'text/javascript', exec: ['pm.test("Status 200", () => pm.response.to.have.status(200));'] } }],
      request: { method: 'POST', url: { raw: 'http://localhost:3005/api/confirm-checkout', protocol: 'http', host: ['localhost'], port: '3005', path: ['api', 'confirm-checkout'] } }
    }
  ]
};

fs.writeFileSync(path.join('newman', 'hotel-booking-collection.json'), JSON.stringify(collection, null, 2));
console.log('✅ ไฟล์ Newman รวมมิตรพร้อมแล้ว!');