# Use the official Node.js image as the base image for building the Node.js backend
FROM node:14.17.6-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the backend files to the container
COPY . .

# Expose port 4000 for the Node.js app
EXPOSE 4000

# Start the Node.js app
CMD ["node", "server.js"]
