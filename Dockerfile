# Use node 22 for better performance and security
FROM node:22-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy app source
COPY . .

# Expose the app port
EXPOSE 3030

# Use a non-root user for security
USER node

# Start the server
CMD [ "node", "server.js" ]
