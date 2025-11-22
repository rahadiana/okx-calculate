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

## The WebSocket bridge listens on 8089 by default (see `subscribe.js`).
EXPOSE 8089

# Use `node` as ENTRYPOINT so users can override the script easily at runtime:
ENTRYPOINT [ "node" ]
# Default to running the Redis->WebSocket bridge. Override the script and args with `docker run <image> other.js`.
CMD [ "subscribe.js" ]