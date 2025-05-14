const { decodeBase64 } = require('bcryptjs')
const pool = require('./pool')

async function addUser(username, password) {
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2);', [username, password])
}

async function getUserByUsername(username) {
    const { rows } = await pool.query('SELECT users.id, username, password, name AS role FROM users LEFT JOIN roles ON roles.id = users.role_id WHERE username = $1', [username])
    return rows[0]
}

async function getUserById(id) {
    const { rows } = await pool.query('SELECT users.id, username, password, name AS role FROM users LEFT JOIN roles ON roles.id = users.role_id WHERE users.id = $1;', [id])
    return rows[0]
}

async function addMessage(message, date_time, user_id) {
    await pool.query('INSERT INTO messages (message, sent_at, user_id) VALUES ($1, $2, $3);', [message, date_time, user_id])
}

async function getAllMessagesWithoutDetails() {
    const { rows } = await pool.query('SELECT id, message FROM messages;')
    return rows
}

async function getAllMessagesWithDetails() {
    const { rows } = await pool.query('SELECT messages.id, message, sent_at, username FROM messages JOIN users ON users.id = messages.user_id ORDER BY sent_at;')
    return rows
}

async function getAllRoles() {
    const { rows } = await pool.query('SELECT * FROM roles;')
    return rows
}

async function addRole(username, role) {
    await pool.query('UPDATE users SET role_id = (SELECT id FROM roles WHERE name = $1) WHERE username = $2;', [role, username])
}

async function removeRole(username) {
    await pool.query('UPDATE users SET role_id = NULL WHERE username = $1;', [username])
}

module.exports = {
    addUser,
    getUserByUsername,
    getUserById, 
    addMessage,
    getAllMessagesWithoutDetails,
    getAllMessagesWithDetails,
    getAllRoles,
    addRole,
    removeRole
}