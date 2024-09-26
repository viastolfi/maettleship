#!/bin/bash
TIMESTAMP=$(date +"%F")

if [[ "$OSTYPE" == "darwin"* ]];then
    export TPATH=$(find /Users -type d -name "maettleship" 2> /dev/null | head -n 1)
else 
    export TPATH=$(find /home -type d -name "maettleship" 2> /dev/null | head -n 1)
fi

echo "==========LOGS : $TIMESTAMP==========="

# GET PATH AND CREATE VARIABLE
echo "PATH TO DIR : $TPATH"
BACKUP_DIR="$TPATH/../maettleship_save"
SRC_DIR="$TPATH"
mkdir -p "$BACKUP_DIR/$TIMESTAMP"
source "$SRC_DIR/.env"
echo "BACKUP_DIR : $BACKUP_DIR"
echo "SRC_DIR : $SRC_DIR"
echo "ENVIRONMENT : $ACTUAL_ENV"

# GET DOCKER CONTAINER ID
CONTAINERID=$(docker ps | grep "mysql" | cut -d ' ' -f 1)
echo "CONTAINER ID : $CONTAINERID"

if [ $ACTUAL_ENV = 'dev' ]; then
    docker exec -i $CONTAINERID mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > "$BACKUP_DIR/$TIMESTAMP/$DB_NAME.sql"
else
    db_password_file=$(cat $SRC_DIR/secrets/db_password.txt)
    db_name_file=$(cat $SRC_DIR/secrets/db_name.txt)
    docker exec -i $CONTAINERID mysqldump -u $DB_USER -p$db_password_file $db_name_file > "$BACKUP_DIR/$TIMESTAMP/$db_name_file.sql"
fi

echo "DATA SAVED ON THE $BACKUP_DIR/$TIMESTAMP/$db_name_file.sql file."
echo "LOGS WRITE ON THE $BACKUP_DIR/db_save.log file"

find "$BACKUP_DIR/" -type d -mtime +7 -exec rm -rf {} \;

echo " " 
