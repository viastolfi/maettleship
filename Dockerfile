FROM node:14

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
#RUN sed -i '1i\<base href="https://codefirst.iut.uca.fr/containers/vincentastolfi-maettleship/">' ./public/index.html 

EXPOSE 3000

ENV DB_HOST=db
ENV DB_USER=root
ENV DB_PASSWORD=password
ENV DB_NAME=battleship

CMD ["npm", "run", "prod"]