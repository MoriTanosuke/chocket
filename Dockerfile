FROM node:14

COPY . .

ARG http_proxy
ARG https_proxy
ENV http_proxy=$http_proxy
ENV https_proxy=$https_proxy

RUN npm install && \
    npm test

ENV PORT=8888
EXPOSE 8888
USER node
CMD ["npm", "start"]
