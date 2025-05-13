const pool = require('./pool')

async function addUser(username, password) {
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2);', [username, password])
}

async function getUserByUsername(username) {
    const { rows } = await pool.query('SELECT users.id, username, password, name FROM users LEFT JOIN roles ON roles.id = users.role_id WHERE username = $1', [username])
    return rows[0]
}

async function getUserById(id) {
    const { rows } = await pool.query('SELECT users.id, username, password, name FROM users LEFT JOIN roles ON roles.id = users.role_id WHERE users.id = $1;', [id])
    return rows[0]
}

async function addMessage(message, date_time, user_id) {
    await pool.query('INSERT INTO messages (message, sent_at, user_id) VALUES ($1, $2, $3);', [message, date_time, user_id])
}

async function getAllMessages() {
    const { rows } = await pool.query('SELECT * FROM messages;')
    return rows
}

module.exports = {
    addUser,
    getUserByUsername,
    getUserById, 
    addMessage,
    getAllMessages
}