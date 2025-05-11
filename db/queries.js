const pool = require('./pool')

async function addUser(username, password) {
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2);', [username, password])
}

async function getUser(username) {
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1;', [username])
    return rows[0]
}

module.exports = {
    addUser,
    getUser
}