# Maettleship

Maettleship is a simple online battleship game that I design for maë (my grilfriend) when lectures are boring. 
It's made entirely in javascript using nodejs for the server part with socketio and express module.

# Requirement

To use maettleship you'll need the following app on your computer

* node js and npm
* mysql

# Installation

Later, maettleship will be usable online but you can test it localy now if you want !

Follow those first steps to get started

```
git clone https://github.com/viastolfi/maettleship.git
npm install
```

Now, you have the repo with all the dependency. After that, you'll have to create the database that is used for the account creation and usage.

```
mysql -u user -p
> mysql source db_script.sql
```

Finally, you need a `.env`file with your personnal mysql information so follow those steps.

```
touch .env
```

The .env file should look like thah

```
DB_USER=userName
DB_PASSWORD=UserPassword
DB_NAME=maettleship
DB_HOST=localhost
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

# TODO

Those point are the feature I still need to introduce

- [ ] Rematch 
- [ ] Connection to your account
- [ ] Player historic (link to his account)
- [ ] Global scoreboard
- [ ] General error handling
- [ ] (lot of) debug

# Author

This project is entirely made by me (ASTOLFI Vincent) 

# Acknowledgement 

Here is a cool list of the different docs I use on this project

- [socket.io documentation](https://socket.io/fr/docs/v4/)
- [express documentation](https://expressjs.com/)
- [mysql documentation](https://dev.mysql.com/doc/)
- [nodejs documentation](https://nodejs.org/docs/latest/api/)