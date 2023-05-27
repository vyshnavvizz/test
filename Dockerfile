# Use the official Node.js image as the base image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install project dependencies
RUN npm install --production

# Copy the server.js file to the container
COPY server.js .

# Copy the views and public folders to the container
COPY views ./views
COPY public ./public

# Expose port 3000 for the Node.js application
EXPOSE 3000

# Start the Node.js application
CMD [ "node", "server.js" ]
