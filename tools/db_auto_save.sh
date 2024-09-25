#!/bin/bash
TIMESTAMP=$(date +"%F")
APATH=$(pwd)

echo "==========LOGS : $TIMESTAMP==========="

if [ $APATH = "/root" ]; then
	echo "USING IN ROOT"
	APATH="$(pwd)/../home/dev"
fi

BACKUP_DIR="$APATH/maettleship_save"
SRC_DIR="$APATH/maettleship"

mkdir -p "$BACKUP_DIR/$TIMESTAMP"
source "$SRC_DIR/.env"

echo "BACKUP_DIR : $BACKUP_DIR"
echo "SRC_DIR : $SRC_DIR"
echo "ENVIRONMENT : $ACTUAL_ENV"

if [ $ACTUAL_ENV = 'dev' ]; then
    docker exec -i maettleship_db_1 mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > "$BACKUP_DIR/$TIMESTAMP/$DB_NAME.sql"
else
    db_password_file=$(cat $SRC_DIR/secrets/db_password.txt)
    db_name_file=$(cat $SRC_DIR/secrets/db_name.txt)
    docker exec -i maettleship_db_1 mysqldump -u $DB_USER -p$db_password_file $db_name_file > "$BACKUP_DIR/$TIMESTAMP/$db_name_file.sql"
fi

find "$BACKUP_DIR/" -type d -mtime +7 -exec rm -rf {} \;

echo " " 
