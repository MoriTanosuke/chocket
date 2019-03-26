FROM node:0.12.6

COPY . .

ARG http_proxy
ARG https_proxy
ENV http_proxy=$http_proxy
ENV https_proxy=$https_proxy

RUN npm config set proxy $http_proxy && \
    npm config set https-proxy $https_proxy && \
    npm install

ENV PORT=8888
EXPOSE 8888
CMD ["node", "app.js"]
