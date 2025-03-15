# Use Node.js base image
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package files from server folder; build context is the project root.
COPY server/package.json server/package-lock.json ./

# Install dependencies (this will build native modules for the container's OS)
RUN npm install

# Copy all server source files from the server folder
COPY server/ ./

# Copy the uploads folder from the project root into the container
COPY uploads /uploads

# Build TypeScript files (ensure tsconfig.json outputs to "dist")
RUN npm run build && ls -la dist

# Expose the port your Express app listens on (internal port 3000)
EXPOSE 3000

# Start the backend in production mode (runs node dist/server.js)
CMD ["npm", "start"]
