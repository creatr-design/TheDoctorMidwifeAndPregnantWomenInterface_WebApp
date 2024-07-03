const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const pg = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

// Middleware to check if the user is authenticated
function checkAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/home', checkAuth, (req, res) => {
    res.sendFile(__dirname + '/public/home.html');
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    pool.query('SELECT * FROM midwives WHERE username = $1 AND password = $2', [username, password], (error, results) => {
        if (error) {
            throw error;
        }
        if (results.rows.length > 0) {
            req.session.user = results.rows[0];
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    });
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.json({ success: false });
        }
        res.json({ success: true });
    });
});

app.post('/api/patients', checkAuth, (req, res) => {
    const { name, phone } = req.body;
    pool.query('INSERT INTO patients (name, phone) VALUES ($1, $2)', [name, phone], (error, results) => {
        if (error) {
            throw error;
        }
        res.json({ success: true });
    });
});

app.put('/api/patients/:id', checkAuth, (req, res) => {
    const id = req.params.id;
    const { name, phone } = req.body;
    pool.query('UPDATE patients SET name = $1, phone = $2 WHERE patientid = $3', [name, phone, id], (error, results) => {
        if (error) {
            throw error;
        }
        res.json({ success: true });
    });
});

app.post('/api/appointments', checkAuth, (req, res) => {
    const { patientId, midwifeId, appointmentDate } = req.body;
    pool.query('INSERT INTO appointments (patientid, midwifeid, appointmentdate) VALUES ($1, $2, $3)', [patientId, midwifeId, appointmentDate], (error, results) => {
        if (error) {
            throw error;
        }
        res.json({ success: true });
    });
});

app.put('/api/appointments/:id', checkAuth, (req, res) => {
    const id = req.params.id;
    const { status } = req.body;
    pool.query('UPDATE appointments SET status = $1 WHERE appointmentid = $2', [status, id], (error, results) => {
        if (error) {
            throw error;
        }
        res.json({ success: true });
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
