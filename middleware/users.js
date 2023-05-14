const jwt = require("jsonwebtoken");
module.exports = {
    validateRegister: (req, res, next) => {
        if (!req.body.username || req.body.username.length < 3) {
        return res.status(400).send({
            msg: 'Ingrese un username de al menos 3 caracteres'
        });
        }
        if (!req.body.password || req.body.password.length < 6) {
        return res.status(400).send({
            msg: 'Ingrese una password de al menos 6 caracteres'
        });
        }
        if (
        !req.body.password_repeat ||
        req.body.password != req.body.password_repeat
        ) {
        return res.status(400).send({
            msg: 'Ambas passwords deben coincidir'
        });
        }
        next();
    },
    isLoggedIn: (req, res, next) => {
        try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(
            token,
            'SECRETKEY'
        );
        req.userData = decoded;
        next();
        } catch (err) {
        return res.status(401).send({
            msg: 'Sesion invalida!'
        });
        }
    }
};
