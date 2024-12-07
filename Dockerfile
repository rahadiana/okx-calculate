FROM node:18

# Buat direktori aplikasi
WORKDIR /usr/src/app

# Instal dependensi aplikasi
# Wildcard digunakan untuk memastikan package.json DAN package-lock.json disalin
# jika tersedia (npm@5+)
COPY package*.json ./

RUN npm install

# Jika Anda membangun kode untuk produksi
# RUN npm ci --omit=dev

# Bundle app source
COPY . .

EXPOSE 8080
CMD [ "node", "app.js" ]