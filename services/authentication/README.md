## Running the application 
Runs the app in the development mode.\
Open [http://localhost:5000](http://localhost:5000) to view it in your browser.

## Deployment of application 
This application is deployed using a Linode server.

### Node.js setup
Install Node.js with curl using the following commands. Note that at the time which the app was built, the node version is **v16.3.2** and npm version is **v8.1.2**.
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Check to see if node was installed
node --version
npm --version
```

### App setup and running the app
Download dependencies, create build file and run the application on the server.
```bash
cd app

# App will be served on port 5000
npm run prod
```
