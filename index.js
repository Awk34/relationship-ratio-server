const fs = require('fs');
const util = require('util');
const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const scrypt = util.promisify(crypto.scrypt);

const dbFileName = process.env.NODE_ENV === 'production' ? 'db.json' : 'test.db.json';
const PORT = process.env.PORT || process.env.NODE_ENV === 'production' ? '80' : '8080';
const SIGNING_KEY = process.env.KEY || process.env.NODE_ENV !== 'production' ? 'test_key' : '';
const EMAIL_REGEX = new RegExp('(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])');

if(!SIGNING_KEY) {
    console.error('No KEY specified');
    process.exit(2);
}

let db = {
    users: [],
};

async function refreshDb() {
    db = JSON.parse(await readFile(dbFileName, 'utf8'));
}
async function saveDb() {
    await writeFile(dbFileName, JSON.stringify(db), 'utf8');
}

const app = express();

app.get('/', (req, res) => {
    res.send('hello world');
});

app.post('/login', (req, res) => {
    const {email, password} = req.body;

    if(!email || !EMAIL_REGEX.test(email)) {
        return res.status(400).send('Invalid email');
    } else if(!password) {
        return res.status(400).send('Invalid password');
    } else if(password.length < 8) {
        return res.status(400).send('Password must be 8+ characters');
    }

    const user = db.users.find(user => user.email === email);

    if(!user) {
        return res.status(400).send('User not found');
    }

    return scrypt(password, user.salt, 64).then(hashedPassword => {
        if(hashedPassword !== user.password) {
            return res.status(400).send('Incorrect password');
        }

        return res.status(200).send('Logged in');
        // TODO
    });
});


app.post('/signup', (req, res) => {
    const {email, password} = req.body;

    if(!email || !EMAIL_REGEX.test(email)) {
        return res.status(400).send('Invalid email');
    } else if(!password) {
        return res.status(400).send('Invalid password');
    } else if(password.length < 8) {
        return res.status(400).send('Password must be 8+ characters');
    } else if(db.users.any(user => user.email === email)) {
        return res.status(400).send('Email address already registered');
    }

    const salt = crypto.randomBytes(16);
    return scrypt(password, salt, 64).then(hashedPassword => {
        const user = {
            email,
            password: hashedPassword,
            salt,
        };

        db.users.push(user);

        return saveDb();
    }).then(() => {
        res.status(201).send('signed up');
    });;
});

refreshDb().then(() => {
    console.log(db);

    app.listen(PORT, () => {
        console.info(`Server listening on port ${PORT}`);
    });
}).catch((err) => {
    console.error(`Couldn\'t read DB file ${dbFileName}`);
    console.error(err);
    process.exit(1);
});
