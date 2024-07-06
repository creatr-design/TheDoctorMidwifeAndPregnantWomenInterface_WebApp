const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const pg = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

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

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Database connection successful:', res.rows);
    }
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
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/home', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.post('/api/auth/login', (req, res) => {
    const { midwifeName, midwifePassword } = req.body;
    pool.query('SELECT * FROM midwives WHERE LOWER(midwifename) = LOWER($1) AND midwifepassword = $2', [midwifeName, midwifePassword], (error, results) => {
        if (error) {
            res.json({ success: false, message: 'Database error' });
            return;
        }
        if (results.rows.length > 0) {
            req.session.user = results.rows[0];
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
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
    const { patientId, midwifeId, appointmentDate, notes } = req.body;
    pool.query('INSERT INTO appointments (patientid, midwifeid, appointmentdate, notes) VALUES ($1, $2, $3, $4)', [patientId, midwifeId, appointmentDate, notes], (error, results) => {
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

app.get('/api/auth/user', checkAuth, (req, res) => {
    res.json(req.session.user);
});

app.get('/api/appointments/next', checkAuth, (req, res) => {
    const midwifeId = req.session.user.midwifeid;
    pool.query('SELECT a.*, p.name as patientName FROM appointments a JOIN patients p ON a.patientid = p.patientid WHERE a.midwifeid = $1 AND a.appointmentdate > NOW() ORDER BY a.appointmentdate ASC LIMIT 1', [midwifeId], (error, results) => {
        if (error) {
            res.json({ success: false, message: 'Database error' });
            return;
        }
        res.json(results.rows[0]);
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
