const { Router } = require('express');
const router = Router();

const {
  addInvoice,
  recordPayment,
  getStoreName,
  getInvoicesPaginated,
  getParticularInvoice
} = require('../controller/invoices');

router.post('/invoices/add-invoice', addInvoice);
router.put('/invoices/record-payment', recordPayment);
router.get('/invoices/get-store-name', getStoreName);
router.get('/invoices/get-invoices-paginated', getInvoicesPaginated); // to avoid db overload in this query we can use rate limitting
router.get('/invoices/fetch-invoice', getParticularInvoice);
// we can add a middleware authenticated service here as well which will help us restrict unwanted api calls to our server

module.exports = router;
