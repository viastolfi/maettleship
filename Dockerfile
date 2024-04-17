FROM node:10
WORKDIR /usr/src/app
COPY ./ ./
RUN sed -i '1i\<base href="https://codefirst.iut.uca.fr/containers/vincentastolfi-maettleship">' ./public/index.html
RUN npm install
EXPOSE 8081
CMD [ "node", "app.js" ]
