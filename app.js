const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const pg = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const axios = require('axios');

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
    port: process.env.DB_PORT,
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
    const { username, midwifePassword } = req.body;
    console.log('Login attempt:', username, midwifePassword);

    pool.query('SELECT * FROM midwives WHERE LOWER(username) = LOWER($1) AND midwifepassword = $2', [username, midwifePassword], (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            res.json({ success: false, message: 'Database error' });
            return;
        }
        if (results.rows.length > 0) {
            console.log('Login successful:', results.rows[0]);
            req.session.user = results.rows[0];
            res.json({ success: true, midwifeName: results.rows[0].firstname + ' ' + results.rows[0].lastname, redirect: '/home' });
        } else {
            console.log('Invalid credentials for:', username);
            res.json({ success: false, message: 'Invalid credentials' });
        }
    });
});

app.get('/api/midwife', (req, res) => {
    if (req.session.user) {
        const midwifeName = req.session.user.firstname + ' ' + req.session.user.lastname;
        res.json({ success: true, midwifeName });
    } else {
        res.json({ success: false, message: 'User not authenticated' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.json({ success: false, message: 'Logout failed' });
        }
        res.json({ success: true });
    });
});

app.get('/api/appointments/next', checkAuth, (req, res) => {
    const midwifeId = req.session.user.midwifeid;
    pool.query(
        `SELECT a.appointmentdate, p.patientname, a.notes
        FROM appointments a
        JOIN patients p ON a.patientid = p.patientid
        WHERE a.midwifeid = $1 AND a.appointmentdate >= NOW()
        ORDER BY a.appointmentdate ASC
        LIMIT 1`,
        [midwifeId],
        (error, results) => {
            if (error) {
                console.error('Error fetching next appointment:', error);
                res.json({ success: false, message: 'Database error' });
                return;
            }
            if (results.rows.length > 0) {
                const appointment = results.rows[0];
                pool.query(
                    `SELECT COUNT(*) as count
                    FROM appointments
                    WHERE midwifeid = $1 AND DATE(appointmentdate) = CURRENT_DATE`,
                    [midwifeId],
                    (countError, countResults) => {
                        if (countError) {
                            console.error('Error fetching appointments count:', countError);
                            res.json({ success: false, message: 'Database error' });
                            return;
                        }
                        res.json({ success: true, appointment, appointmentsToday: countResults.rows[0].count });
                    }
                );
            } else {
                res.json({ success: false, message: 'No upcoming appointments' });
            }
        }
    );
});

app.post('/api/appointments', checkAuth, (req, res) => {
    const { patientId, appointmentDate, notes } = req.body;
    const midwifeId = req.session.user.midwifeid;
    pool.query(
        `INSERT INTO appointments (patientid, midwifeid, appointmentdate, notes)
        VALUES ($1, $2, $3, $4)`,
        [patientId, midwifeId, appointmentDate, notes],
        (error, results) => {
            if (error) {
                console.error('Error creating appointment:', error);
                res.json({ success: false, message: 'Database error' });
                return;
            }
            res.json({ success: true });
        }
    );
});

app.get('/api/pregnancy-progress', checkAuth, (req, res) => {
    const midwifeId = req.session.user.midwifeid;

    pool.query(
        `SELECT p.pregnancy_start_date
        FROM patients p
        JOIN appointments a ON a.patientid = p.patientid
        WHERE a.midwifeid = $1
        ORDER BY a.appointmentdate DESC
        LIMIT 1`,
        [midwifeId],
        (error, results) => {
            if (error) {
                console.error('Error fetching pregnancy progress:', error);
                res.json({ success: false, message: 'Database error' });
                return;
            }
            if (results.rows.length > 0) {
                const pregnancyStartDate = new Date(results.rows[0].pregnancy_start_date);
                const now = new Date();
                const pregnancyDuration = 280; // typical pregnancy duration in days

                const daysElapsed = Math.floor((now - pregnancyStartDate) / (1000 * 60 * 60 * 24));
                const progress = Math.min((daysElapsed / pregnancyDuration) * 100, 100);

                res.json({ success: true, progress });
            } else {
                res.json({ success: false, message: 'No pregnancy data available' });
            }
        }
    );
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
