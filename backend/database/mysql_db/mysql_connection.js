// This file creates a connection to mysql and returns it
import mysql from 'mysql2'

// Connection
export function connectToMySQL() {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE
        });

        connection.connect((error)=> {
            if (error) {
                console.log('Error! Could not connect MySQL')
                return reject()
            }

            console.log('Successfully connected to MySQL')
            resolve(connection)
        })

    })
}
