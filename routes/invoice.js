const { Router } = require('express');
const router = Router();

const {
  addInvoice,
  recordPayment,
  getStoreName
} = require('../controller/invoices');

router.post('/invoices/add-invoice', addInvoice);
router.put('/invoices/record-payment', recordPayment);
router.get('/invoices/get-store-name', getStoreName);
// we can add a middleware authenticated service here as well which will help us restrict unwanted api calls to our server

module.exports = router;
