# Use the UBI image as the base image
FROM registry.access.redhat.com/ubi8/nodejs-14

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install required npm modules
RUN npm install express
RUN npm install cors
RUN npm install body-parser jsonwebtoken
RUN npm install axios

# Install Node.js dependencies
RUN npm install

# Copy the rest of the backend files to the container
COPY . .

# Expose port 4000 for the Node.js app
EXPOSE 4000

# Start the Node.js app
CMD ["node", "server.js"]
