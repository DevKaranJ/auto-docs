# Use Node.js as base image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Build the application
RUN npm run build

# Expose ports
EXPOSE 3000
EXPOSE 5173

# Start the application
CMD ["npm", "run", "dev"]