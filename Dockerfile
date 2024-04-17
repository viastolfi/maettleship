FROM node:10
WORKDIR /usr/src/app
COPY ./ ./
RUN npm install
RUN npm install -g nodemon
EXPOSE 8080
CMD [ "npm", "run", "dev" ]
