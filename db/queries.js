const pool = require('./pool')

async function addUser(username, password) {
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2);', [username, password])
}

async function getUser(id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1;', [id])
    return rows[0]
}

module.exports = {
    addUser,
    getUser
}