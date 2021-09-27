FROM node:14

COPY . .

RUN npm install && \
    npm test

ENV PORT=8888
EXPOSE 8888

USER node
CMD ["npm", "start"]
