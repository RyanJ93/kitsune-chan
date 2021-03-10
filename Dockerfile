FROM node:15.11.0-alpine3.10

RUN mkdir -p /home/app/node_modules
RUN chown -R node:node /home/app

WORKDIR /home/app
RUN apk add git vim
COPY . .
RUN rm -rf /home/app/config
RUN rm -rf /home/app/public
RUN rm -rf /home/app/test
RUN rm -rf /home/app/*.log
RUN rm -rf /home/app/package-lock.json
RUN rm -rf /home/app/node_modules/
RUN npm i
RUN npm install pm2 -g
RUN chown -R node:node /home/app
USER node
CMD ["pm2-runtime", "index.js"]
