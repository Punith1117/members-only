const { Client } = require("pg");
require('dotenv').config()

const SQL = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    username VARCHAR ( 50 ) NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY, 
    message VARCHAR ( 300 ) NOT NULL,
    sent_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    user_id INTEGER NOT NULL, 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

`;

async function main() {
    console.log('seeding...')
    const client = new Client({
        connectionString: process.env.PUBLIC_DATABASE_URL,
    });
    await client.connect();
    await client.query(SQL);
    await client.end();
    console.log("done");
}

main();