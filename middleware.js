function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next()
    } else {
        res.status(401).send('You are not authenticated')
    }
}

function isAdmin(req, res, next) {
    if (req.isAuthenticated()) {
        if (req.user.role == 'Admin') {
            next()
        } else 
            res.status(403).send('You are not authorized')
    } else
        res.status(401).send('You are not authenticated')
}

module.exports = {
    isAuthenticated,
    isAdmin
}