# Start from an official Node image (the base layer)
FROM node:24-bookworm-slim

# Set the working folder inside the container
WORKDIR /app

# Copy dependency list first (speeds up rebuilds via caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the rest of your code
COPY . .


# Document the port the app listens on
EXPOSE 3001

# Command to run when the container starts
CMD ["node", "server.js"]