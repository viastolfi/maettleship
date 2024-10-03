#!/bin/bash
DB_USER="root"
DB_PASSWORD="password"
DB_NAME="battleship"
CONTAINERID=$(docker ps | grep "mysql" | cut -d ' ' -f 1)

# Function to execute MySQL commands
function run_query() {
    query=$1
    docker exec -i $CONTAINERID mysql -u$DB_USER -p$DB_PASSWORD $DB_NAME -e "$query"
}

# Insert 20 fake users
echo "Inserting fake users..."
for i in {1..20}; do
    pseudo="Player_$i"
    password="password_$i"  # This should ideally be hashed in a real scenario
    hashed_password=$(echo -n $password | md5sum | awk '{print $1}')  # Simple hashing for this test case
    run_query "INSERT INTO users (pseudo, hashed_password) VALUES ('$pseudo', '$hashed_password');"
done

# Get user IDs for reference
user_ids=($(docker exec -i $CONTAINERID mysql -u$DB_USER -p$DB_PASSWORD -e "SELECT id FROM $DB_NAME.users" | awk 'NR > 1'))

# Insert games in the scoreboard between random users
echo "Inserting random games in the scoreboard..."
for i in {1..30}; do
    # Randomly pick two players
    player1=${user_ids[$RANDOM % ${#user_ids[@]}]}
    player2=${user_ids[$RANDOM % ${#user_ids[@]}]}
    
    # Make sure player1 and player2 are not the same
    while [ "$player1" -eq "$player2" ]; do
        player2=${user_ids[$RANDOM % ${#user_ids[@]}]}
    done

    # Generate random win counts for both players
    player1Win=$((RANDOM % 10))
    player2Win=$((RANDOM % 10))

    # Insert into the scoreboard
    run_query "INSERT INTO scoreboards (player1, player2, player1Win, player2Win) VALUES ($player1, $player2, $player1Win, $player2Win);"
done

# Insert total win/lose score for each user in the score table
echo "Updating user scores..."
for playerId in "${user_ids[@]}"; do
    # Calculate the total wins and losses for the player based on scoreboard data
    wins=$(docker exec -i $CONTAINERID mysql -u$DB_USER -p$DB_PASSWORD -e "SELECT SUM(player1Win) FROM $DB_NAME.scoreboards WHERE player1 = $playerId" | awk 'NR == 2')
    losses=$(docker exec -i $CONTAINERID mysql -u$DB_USER -p$DB_PASSWORD -e "SELECT SUM(player2Win) FROM $DB_NAME.scoreboards WHERE player2 = $playerId" | awk 'NR == 2')

    if [ -z "$wins" ]; then wins=0; fi
    if [ -z "$losses" ]; then losses=0; fi

    # Insert or update the score for the player
    run_query "INSERT INTO score (playerId, wins, loses) VALUES ($playerId, $wins, $losses) ON DUPLICATE KEY UPDATE wins=$wins, loses=$losses;"
done

echo "Fake data insertion completed."
