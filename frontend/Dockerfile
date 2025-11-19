# frontend/Dockerfile (Phiên bản Development)

FROM node:18-alpine

WORKDIR /app

# Copy package.json trước để tận dụng cache của Docker
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ code
COPY . .

# Mở cổng 3000 (Mặc định của Vite có thể là 5173, nhưng ta sẽ map ra 3000)
EXPOSE 3000

# Chạy lệnh start (đã định nghĩa trong package.json là "vite --host")
CMD ["npm", "start"]