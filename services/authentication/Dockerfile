FROM node:14-buster

# Create app directory and epgpub directory
RUN mkdir /app
WORKDIR /app

# Install app dependencies
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install

#Bundle app source
COPY . .

EXPOSE 5100

CMD npm run server