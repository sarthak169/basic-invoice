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

