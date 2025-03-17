FROM node:13-alphine

WORKDIR /frontend

COPY package*.json .

RUN npm install

COPY . .

CMD ["npm" "start"]