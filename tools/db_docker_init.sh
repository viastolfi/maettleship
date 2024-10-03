#!/bin/sh

# Use it to create mysql container so you don't have to make it run locally
# Run it from the root directory 
docker network create app-network

docker stop mysql-maettleship
docker remove mysql-maettleship
docker run --name db -d -p 3306:3306 \
		-e MYSQL_ROOT_PASSWORD='password' \
		-e MYSQL_USER='vinz' \
		-e MYSQL_PASSWORS='1234'  \
		-v ./db:/docker-entrypoint-initdb.d mysql
