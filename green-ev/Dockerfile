FROM oven/bun:1

WORKDIR /green-ev

COPY package.json .
COPY bun.lock .

RUN bun install

EXPOSE 3000
CMD ["bun", "--bun", "run", "dev"]
