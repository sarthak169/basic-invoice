const HTTPStatus = require('http-status-codes');
const moment = require('moment');
const shortid = require('shortid');
const log = require('../loggers/appLogger')(__filename);
const Invoices = require('../models/invoice');
const getInitials = require('../utilities/getInitials');


const Validations = require('../utilities/Validations');


module.exports.addInvoice = async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  try {
    log.info('Adding Invoice');
    const {
      brandName,
      salesmanName,
      invoiceAmount,
      retailerID,
      retailerName,
      retailerPhoneNumber,
      collectionDate, // here we are expecting collection date to be in format of DD/MM/YYYY
      dateOfCreation, // Format - DD/MM/YYYY
    } = req.body;

    if (!brandName) {
      log.error(`No Brand name present while adding bill for retailer: ${retailerID} by salesman: ${salesmanName} FROM IP: ${ip}`);
      return res.status(HTTPStatus.BAD_REQUEST).send({ message: 'No Brand Name Present' });
    }

    if (!salesmanName) {
      log.error(`No salesman name present while adding bill for retailer: ${retailerID} FROM IP: ${ip}`);
      return res.status(HTTPStatus.BAD_REQUEST).send({ message: 'No Salesman Name Present' });
    }

    if (!Validations.isValidInvoiceAmountAndGreaterThanZero(+invoiceAmount)) {
      log.error(`Invalid Invoice Amount found for retailer: ${retailerID} and brand: ${brand} FROM IP: ${ip}`);
      return res.status(HTTPStatus.BAD_REQUEST).send({ message: 'Invalid Invoice Amount' });
    }

    if (!retailerID) {
      log.error(`No retailer id present while adding bill for brand: ${brandName} FROM IP: ${ip}`);
      return res.status(HTTPStatus.BAD_REQUEST).send({ message: 'No retailer id present' });
    }

    if (!Validations.isValidNumber(retailerPhoneNumber)) {
      log.error(`Invalid phone number: ${retailerPhoneNumber} while adding bill for retailer id: ${retailerID} FROM IP: ${ip}`);
      return res.status(HTTPStatus.BAD_REQUEST).send({ message: 'Invalid Phone Number' });
    }

    const collectionDateisValid = moment(collectionDate.trim(), 'DD/MM/YYYY');

    if (!collectionDateisValid.isValid() ) {
      log.error(`Invalid collection date while adding bill for retailer id: ${retailerID} FROM IP: ${ip}`);
      return res.status(HTTPStatus.BAD_REQUEST).send({ message: 'Invalid Collection Date' });
    }

    let dateOfCreationOfInvoice = null;

    if (dateOfCreation) {
      dateOfCreationOfInvoice = moment(dateOfCreation.trim(), 'DD/MM/YYYY');
      if (!dateOfCreationOfInvoice.isValid()) {
        log.error(`Invalid Date of creation while adding bill for retailer id: ${retailerID} FROM IP: ${ip}`);
        return res.status(HTTPStatus.BAD_REQUEST).send({ message: 'Invalid Date of creation' });
      }
    } else {
      dateOfCreationOfInvoice = moment().startOf('day');
    }
    
    const code = [getInitials(brandName), '/', shortid.generate()].join(''); // a better logic for this would be for each brannch we keep a sequence of number which will be incremented per bill

    const invoiceObject = {
      code,
      brandName,
      salesmanName,
      invoiceAmount,
      retailerID,
      retailerName,
      paymentRecord: [],
      retailerPhoneNumber,
      collectionDate: collectionDateisValid,
      dateOfCreation: dateOfCreationOfInvoice,
      createdBy: salesmanName,
      createdOn: new Date(),
      modifiedBy: salesmanName,
      modifiedOn: new Date()
    }
    const newInvoice = new Invoices(invoiceObject);
    log.info(`Saving Invoice: ${code} FROM IP: ${ip}`);
    await newInvoice.save();
    log.info(`Invoice: ${code} Saved Successfully`);
    return res.status(HTTPStatus.OK).send({message: 'Invoice Saved Successfully'});
  } catch (err) {
    // here an unhandled error occured while processing
    log.error('Error while saving invoice', err);
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({message: 'Something went wrong'});
  }
};

module.exports.recordPayment = async (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  try {
    const {
      invoiceCode,
      amount,
      remark,
    } = req.body;

    if (!invoiceCode) {
      log.error(`No Invoice Code sent for recording payment from ip: ${ip}`);
      return res.status(HTTPStatus.BAD_REQUEST).send({ message: 'Invalid Invoice Code' });
    }

    const invoice = await Invoices.findOne({ code: invoiceCode }, { invoiceCode: 1, _id: 0, invoiceAmount: 1, amountCollected: 1, paymentRecord: 1  });

    if (!invoice) {
      log.error(`Invalid Invoice code: ${invoiceCode} from ip: ${ip}`);
      return res.status(HTTPStatus.BAD_REQUEST).send({ message: 'Invoice Code not present' });
    }

    if (!Validations.isValidInvoiceAmountAndGreaterThanZero(+amount)) {
      log.error(`Invalid Amount sent for invoice code: ${invoiceCode} from ip: ${ip}`);
      return res.status(HTTPStatus.BAD_REQUEST).send({ message: 'Invalid Amount' });
    }

    let remarkToBeUsed = '';

    if (remark) remarkToBeUsed = remark;

    const remainingBalance = invoice.invoiceAmount - invoice.amountCollected;

    if (remainingBalance < amount) {
      log.error(`Collection Amount is more than the pending amount for invoice ${invoiceCode}`);
      return res.status(HTTPStatus.BAD_REQUEST).send({ message: 'Collection Amount is more than the pending amount' });
    }

    const session = await Invoices.startSession();
    session.startTransaction();
    try {
      const opts = { session };
      const paymentRecorded = {
        amount,
        remark: remarkToBeUsed
      };
      await Invoices.updateOne({ code: invoiceCode }, { $inc: { amountCollected: amount }, $push: { paymentRecord: paymentRecorded } }, opts);
      await session.commitTransaction();
      session.endSession();
    } catch (err) {
      // If an error occurred, abort the whole transaction and
      // undo any changes that might have happened
      log.error('Error occured while commiting txn', err);
      await session.abortTransaction();
      session.endSession();
      throw Error();
    }
    return res.status(HTTPStatus.OK).send({ message: 'Invoice Updated Successfully' });
  } catch (err) {
    log.error('Error while updating invoice', err);
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ message: 'Something went wrong' });
  }
}

module.exports.getStoreName = async (req, res) => {
  try {
    const { name } = req.body;
    let todaysDate = moment().startOf('day');
    log.info(`Searching for all invoices for today starting with: ${name} DATE:${todaysDate}`);
    let nextDay = moment().startOf('day');
    nextDay.add(1, 'days');
    const query = await Invoices.aggregate([
      {
        "$search": {
          'index': 'retailNameSearch',
          "autocomplete": {
            "query": `${name}`,
            "path": "retailerName",
            'tokenOrder': 'sequential',
            "fuzzy": {
              "maxEdits": 2,
              "prefixLength": 3,
            },
          },
        },
      },
      {
        $match: {
          $and: [
            { collectionDate: { $gte: todaysDate.toDate(), } },
            { collectionDate: { $lt: nextDay.toDate(), } },
          ]
        }
      },
      {
        $group: {
          _id: 'code',
          retailerName: { $addToSet: '$retailerName' },
        }
      },
      // {
      //   $limit: 3 // we cann use the limit feture later on when we implement pagination and things like that
      // },
      {
        $project: {
          "_id": 0,
          retailerName: 1,
        }
      }
    ]);
    return res.status(HTTPStatus.OK).send(query);
  } catch (err) {
    log.error('Error while getting store names', err);
    return res.status(HTTPStatus.INTERNAL_SERVER_ERROR).send({ message: 'Something went wrong' });
  }
};