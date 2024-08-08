# Maettleship

Maettleship is a simple online battleship game that I design for maë (my grilfriend) when lectures are boring. 
It's made entirely in javascript using nodejs for the server part with socketio and express module. I also use mysql for all my database part. Finally, I use docker and a vps that I pay for online deployment

# Requirement

To use maettleship you'll need the following app on your computer

* node js and npm
* mysql
* A firefox derived web browser (Don't know why it doesn't work on chrome)

# Installation

### Online

I recently add a branch called `docker-deployment` which I use to deploy maettleship on an online vps. I can't give you the url now cause there is still a lot of security problem that I want to fix first, but be patient it'll come.

### Locally

Follow those first steps to get started if tou want to run maettleship locally

```
git clone https://github.com/viastolfi/maettleship.git
cd maettleship
npm install
```

Now, you have the repo with all the dependency. After that, you'll have to create the database that is used for the account creation and usage.

```
mysql -u user -p
> mysql source db_script.sql
```

Finally, you need a `.env`file with your personnal mysql information so follow those steps. You also need this file to specify your cookie's private key so you can create them

```
touch .env
```

The .env file should look like that

```
DB_USER=userName
DB_PASSWORD=UserPassword
DB_NAME=maettleship
DB_HOST=localhost
COOKIE_SECRET_KEY=secret_key
```

Now you can start the server using the following command on your terminal.

`npm run start`

# Current State

The current state of maettleship is the following one

- [X] Place your piece on your board
- [X] Create a private game that give you your party code
- [X] Join a private game with a party code
- [X] Game is playable (hit, win)
- [X] Player left the game situation handled
- [X] End game (partially handled)
- [X] Create an account and add it on the database
- [X] Connection to your account
- [X] Rematch 

# TODO

Those point are the feature I still need to introduce

- [ ] Security improvement (hashed password, sql injection handling)
- [ ] Fix all the problems linked to my rooms implementation
- [ ] Player historic (link to its account)
- [ ] Global scoreboard
- [ ] General error handling
- [ ] (lot of) debug

# Author

This project is entirely made by me (ASTOLFI Vincent). I suggest you to check on my github profile if you want to see the other project I've done for my studies or the ones I do in my free time. 

# Acknowledgement 

Here is a cool list of the different docs I used on this project

- [socket.io documentation](https://socket.io/fr/docs/v4/)
- [express documentation](https://expressjs.com/)
- [mysql documentation](https://dev.mysql.com/doc/)
- [nodejs documentation](https://nodejs.org/docs/latest/api/)

This project aim to be fully functionnable one day so any recommendation is welcome !