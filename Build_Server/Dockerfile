FROM node:20-alpine

ARG DIRECTORY_ID

WORKDIR /app

COPY ./dist/output/${DIRECTORY_ID}/ .

RUN npm install

RUN npm run build

CMD ["echo", "Build complete"]