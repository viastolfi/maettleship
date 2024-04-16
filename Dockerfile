FROM node:10
WORKDIR /usr/src/app
COPY ./ ./
RUN npm install
EXPOSE 8080
CMD [ "npm", "run", "start" ]
