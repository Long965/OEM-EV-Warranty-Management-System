# Base image for Node.js
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ source code
COPY . .

# Expose port cho React app
EXPOSE 3000

# Lệnh khởi động React dev server
CMD ["npm", "start"]
