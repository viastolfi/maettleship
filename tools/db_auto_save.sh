#!/bin/bash
source .env

TIMESTAMP=$(date +"%F")
BACKUP_DIR="../maettleship_save"
mkdir -p "$BACKUP_DIR/$TIMESTAMP"

if [ $ACTUAL_ENV = 'dev' ]; then
    docker exec -i mysql-maettleship mysqldump -u $DB_USER -p$DB_PASSWORD $DB_NAME > "$BACKUP_DIR/$TIMESTAMP/$DB_NAME.sql"
else
    db_password_file=$(cat ./secrets/db_password.txt)
    db_name_file=$(cat ./secrets/db_name.txt)
    docker exec -i mysql-maettleship mysqldump -u $DB_USER -p$db_password_file $db_name_file > "$BACKUP_DIR/$TIMESTAMP/$db_name_file.sql"
fi

find "$BACKUP_DIR/" -type d -mtime +7 -exec rm -rf {} \;