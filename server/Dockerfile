# Use Node.js base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files from the server folder (build context is project root)
COPY server/package.json server/package-lock.json ./

# Install dependencies (DO NOT copy node_modules from host)
RUN npm install && npm rebuild bcrypt

# Copy all server source files from /server
COPY server/ ./

# Copy uploads folder (optional) from project root
COPY uploads /uploads

# Build TypeScript (ensure tsconfig.json is set to output to dist)
RUN npm run build

# Expose the port your Express app listens on
EXPOSE 3000

# Start the backend in production mode
CMD ["npm", "start"]
