const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const db = require('../lib/db.js');
const userMiddleware = require('../middleware/users.js');
// router.post('/sign-up', (req, res, next) => {});
router.post('sign-up', userMiddleware.validateRegister, (req, res, next) => {});
router.post('/login', (req, res, next) => {});
router.get('/secret-route', (req, res, next) => {
    res.send('Esto es confidencial, solo usuarios logeados pueden verlo...');
});

router.post('/sign-up', userMiddleware.validateRegister, (req, res, next) => {
    db.query(
    `SELECT * FROM users WHERE LOWER(username) = LOWER(${db.escape(
        req.body.username
    )});`,
    // si el usuario ya existe
    (err, result) => {
        if (result.length) {
        return res.status(409).send({
            msg: 'El usuario ya existe...'
        });
        } else {
            // si el usuario esta disponible
        bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
            return res.status(500).send({
                msg: err
            });
            } else {
            db.query(
                `INSERT INTO users (id, username, password, registered) VALUES ('${uuid.v4()}', ${db.escape(
                req.body.username
                )}, ${db.escape(hash)}, now())`,
                (err, result) => {
                if (err) {
                    throw err;
                    return res.status(400).send({
                    msg: err
                    });
                }
                return res.status(201).send({
                    msg: 'Registrado!'
                });
                }
            );
            }
        });
        }
    }
    );
});

router.post('/login', (req, res, next) => {
    db.query(
    `SELECT * FROM users WHERE username = ${db.escape(req.body.username)};`,
    (err, result) => {
        // si el usuario no existe
        if (err) {
        throw err;
        return res.status(400).send({
            msg: err
        });
        }
        if (!result.length) {
        return res.status(401).send({
            msg: 'Username or password is incorrect!'
        });
        }
        // verifica password
        bcrypt.compare(
        req.body.password,
        result[0]['password'],
        (bErr, bResult) => {
            // password incorrecta
            if (bErr) {
            throw bErr;
            return res.status(401).send({
                msg: 'Usuario o password incorrecta!'
            });
            }
            if (bResult) {
            const token = jwt.sign({
                username: result[0].username,
                userId: result[0].id
                },
                'SECRETKEY', {
                expiresIn: '7d'
                }
            );
            db.query(
                `UPDATE users SET last_login = now() WHERE id = '${result[0].id}'`
            );
            return res.status(200).send({
                msg: 'Sesion iniciada!',
                token,
                user: result[0]
            });
            }
            return res.status(401).send({
            msg: 'Usuario o password incorrecta!'
            });
        }
        );
    }
    );
});
router.get('/secret-route', userMiddleware.isLoggedIn, (req, res, next) => {
    console.log(req.userData);
    res.send('Esto es confidencial, solo los usuarios loggeados lo pueden ver...');
});
module.exports = router;