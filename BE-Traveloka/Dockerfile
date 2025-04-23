# 1. Chọn base image (Node.js phiên bản mới nhất)
FROM node:20
 
# 2. Thiết lập thư mục làm việc trong container
WORKDIR /app

# 3. Copy file package.json và package-lock.json vào container
COPY package*.json ./

# 4. Cài đặt các dependencies
RUN npm install

# 5. Copy toàn bộ code từ thư mục hiện tại vào container
COPY . .

# 6. Mở cổng 3000 để container có thể lắng nghe yêu cầu
EXPOSE 4000

# 7. Cấu hình lệnh chạy ứng dụng khi container khởi động
CMD ["node", "server.js"]