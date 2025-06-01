FROM node:24

WORKDIR /green-ev

COPY package.json .
COPY bun.lock .

RUN npm install --global bun && bun install

EXPOSE 3000
CMD ["bun", "--bun", "run", "dev"]
