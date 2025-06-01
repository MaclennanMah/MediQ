// This file creates a connection to mysql and returns it
var mysql = require('mysql')

// Connection
var connection = mysql.createConnection({
    host: '',
    user: '',
    password: ''
});

// Connect it
connection.connect((error) => {
    if (error) {
        console.log('Error connecting to MYSQL: ', error)
        return;
    }

    console.log('Successfully connected to MySQL')
});

// Export it
module.exports = connection;