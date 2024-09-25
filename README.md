# Maettleship

Maettleship is a simple online battleship game that I design for maë (my grilfriend) when lectures are boring. 
It's made entirely in javascript using nodejs for the server part with socketio and express module. I also use mysql for all my database part. Finally, I use docker and a vps that I pay for online deployment

# Requirement

To use maettleship you'll need the following app on your computer

* node js and npm
* mysql
* docker
* cron # Not mandatory but usefull

# Installation

### Online

You can reach maettleship here : https://maettleship.com
Even if I've improve security a lot recently I encourage you to not use your real password we never know when a new attack I didn't handle will come.

### Locally

Follow those first steps to get started if tou want to run maettleship locally

```
git clone https://github.com/viastolfi/maettleship.git
cd maettleship
npm install
```

Now, you have the repo with all the dependency. After that, you'll have to create the database that is used for the account creation and usage.

```
chmod +x ./tools/db_docker_init.sh
./tools/db_docker_init.sh
```

I choose to use container for mysql to avoid bugs that can happened when working on other computers that my main one. It could also fix bug you could face so it's better overall.

Finally, you will find a `.env`file with your personnal mysql information and cookie private key 

You can use the env file as it is but if you want make it yours just don't forget to have the same variable in your env file that in you mysql config.

The `ACTUAL_ENV` variable aim to make the switch between dev and prod environment easier. You won't have to change it if you want to run maettleship localy.

Now you can start the server using the following command on your terminal.

`npm run dev`

### Database auto save

I add a way to save your database automaticly so you want loose your data !

To use it, you can read the script you can find here `./tools/db_auto_save.sh`

This script use the mysqldump command to create a file that you'll be able to use in your database to inject back the data after you recreate your mysql container.

To make it automatic, you can use Cron 

#### Step 

Install cron

```bash
sudo apt install cron
```

Modify the cron file to make it run your command automaticly

```bash
crontab -e

# Add this line at the bottom of the oppened file
# In this example, I run my script every day at 12am (UTC) and save logs
0 12 * * * /home/dev/maettleship/tools/db_auto_save.sh >> /home/dev/maettleship_save/db_save.log 2>&1 
```

Now, you will find a `maettleship_save` directory with the logs and your saves updated every year.

To use the `*.sql` file in your database after the db crash, you can use the following command

```bash
cat /maettleship_save/LAST_DATE/battleship.sql | docker exec -i your_mysql_container_name mysql -u root -p yourdatabase
```

# Current State

The current state of maettleship is the following one

- [X] Place your piece on your board
- [X] Create a private game that give you your party code
- [X] Join a private game with a party code
- [X] Game is playable (hit, win)
- [X] Player left the game situation handled
- [X] End game
- [X] Create an account and add it on the database
- [X] Connection to your account
- [X] Rematch 
- [X] Security improvement (hashed password, sql injection handling)
- [X] Reverse proxy for better URL
- [X] HTTPS implementation
- [X] General error handling
- [X] Database automatic save and logs

# TODO

Those point are the feature I still need to introduce

- [ ] UX improvement
- [ ] Player historic (link to its account)
- [ ] Global scoreboard
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
