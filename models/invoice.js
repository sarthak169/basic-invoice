const mongoose = require('mongoose');

const { Schema } = mongoose;

const invoiceSchema = new Schema({
  code: { // this will be the primary key for doing most of the operations we are gonna index this for faster query
    type: String,
    required: true,
    unique: true,
    index: true,
    minlength: 8,
    maxlength: 16
  },
  status: { // just creating this field as this will be very useful for further uses in invoice like once payment amount matches    invoice amount then we can mark status as completed or something like that
    type: String,
    default: 'PENDING_COMPLETION'
  },
  brandName: { // this will be the brand name for which the invoice is
    type: String,
    required: true,
    max: 64
  }, 
  salesmanName: { // this is the name of the salesman 
    type: String,
    required: true,
    max: 32
  }, 
  invoiceAmount: { // this will be the invoice amount to be paid it cannot be less than 0
    type: Number,
    min: 0,
  },
  retailerID: { // this will be the retailed id for whom the bill is there
    type: String,
    required: true
  },
  retailerName: { // this will be the retailer name
    type: String,
    required: true,
    index: true,
  },
  amountCollected: { // this is the total amounnt collected till now, it is summation of payments from field paymentRecord
    type: Number,
    min: 0,
    default: 0,
  },
  paymentRecord: { // this field is for recording all the payments attained with values and reason
    type: Array, 
    default: []
  },
  retailerPhoneNumber: {
    type: String,
    max: 10,
    min: 10,
  },
  collectionDate: {
    type: Date,
    required: true
  },
  dateOfCreation: { // this is the date of creation of invoice, this will be taken from user it can be backdated as well
    type: Date,
    default: Date.now()
  },
  createdOn: { // this is the date when the invoice is created on our portal
    type: Date,
    required: true,
    default: Date.now()
  },
  modifiedOn: { // this is the date when last modification happenned on the invoice
    type: Date,
    required: true,
    default: Date.now()
  },
  createdBy: { // this is the username of person who created this invoice
    type: String,
    required: true,
  },
  modifiedBy: { // this is the username of last person who modified this bill
    type: String,
    required: true,
  }
});

const Bill = mongoose.model('Invoice', invoiceSchema);

module.exports = Bill;
