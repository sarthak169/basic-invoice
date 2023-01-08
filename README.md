# basic-invoice
 
 ## Tools
 1. Install Node.js using nvm - node version manager
	 1. Install [nvm](https://github.com/nvm-sh/nvm#install--update-script)
	 2. Install node.js **v10.24.1** using nvm

        ```bash
        $ nvm install v10.24.1
        ```

	 3. Verify installation

        ```bash
        $ node -v
        ```

 2. Install [nodemon](https://nodemon.io/)

    ```bash
    $ npm i -g nodemon
    ```

# Development workflow

## Running the app

### First time run (assuming that you have cloned the repo):

1. Navigate to `basic-invoice` directory, install node modules and start the server

	```bash
    $ npm install
    $ npm start
	```

2. Copy `.env` file from the `.env.sample` in server folder

	```bash
	$ cd basic-invoice
	$ cp .env.sample .env
	```
3. Fill in the required fields in .env

4. Server is accessible on `http://localhost:8080`


# Database Scehma

### We have one collection in this repo viz Invoices as all the workflow are based around that only. Below are the fields explained

1. ```code```: This is the primary key of our schema, which means it is unique and required. we have also added a validation of min and max length of our code that is 8 and 16. We have also indexed this field as this will be used heavily for operations.
2. ```status```: This is a string which will be later used for knowing the stage at which the invoice is currently at. this is a non mandatory field
3. ```brandName```: This is the name of the brand for which the invoice is made. This is a required field and we have set a limit of 64 for the length of brandName.
4. ```salesmanName```: This is the name of salesman who is pushing the bill onto our system. This is a required field and we have set a limit of 32 for the length;
5. ```invoiceAmount```: This is the total amounnt for which the invoice is raised. This is a number field and it cannot be less than 0.
6. ```retailerID```: This is the retailer ID. This field is gonna be string and it is basically a unique code for every retailer that is present on the portal.
7. ```retailerName```: This is the name of the retailer for which the invoice is raised. This is quite useful field for us. We have indexed this for searching purpose as well as we have created a autocomplete index named ``retailNameSearch`` also on this field which uses ``edgeGram`` for tokenization. For the autocomplete index we have set ``maxGrams`` as 7 as well as ``minGrams`` as 3 for the searching purpose.
8. ```amountCollected```: This is the total amount which has been collected by distrubuter till now. It is a Number Field. It cannot be less than 0.
9. ```paymentRecord```: This is an array which we have maintained to keep a track of payments made along with reason. Everytime a paymennt is made against invoice we push a new entry into this array.
10. ```retailerPhoneNumber```: This is the retailers phone number. Validations put are it has to be of 10 characters.
11. ```collectionDate```: This is the date by which the bill has to be collected. It is of type Date. It is a required field
12. ```dateOfCreation```: This is the date when the invoice is created. If not provided default date is today's date.
13. ```createdOn```: This field specifies on what date the document was created. It is of type Date
14. ```createdBy```: This field specifies who created the document. It is of type string;
15. ```modifiedOn```: This field specifies when was the document updated last. It helps is logging puposes. It is of type Date.
16. ```modifiedBy```: This field specifies by whom the document updated last. It helps is logging puposes. It is of type String.



