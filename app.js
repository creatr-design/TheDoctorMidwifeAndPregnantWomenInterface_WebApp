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
    const { username, midwifePassword } = req.body;

    pool.query('SELECT * FROM midwives WHERE LOWER(username) = LOWER($1) AND midwifepassword = $2', [username, midwifePassword], (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            res.json({ success: false, message: 'Database error' });
            return;
        }
        if (results.rows.length > 0) {
            req.session.user = results.rows[0];
            res.json({ success: true, midwifeName: results.rows[0].firstname + ' ' + results.rows[0].lastname });
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

app.post('/api/auth/send-otp', (req, res) => {
    const { phoneNumber } = req.body;

    axios.post('https://sms.arkesel.com/api/otp/generate', {
        expiry: 5,
        length: 6,
        medium: 'sms',
        message: 'This is OTP from Arkesel, %otp_code%',
        number: phoneNumber,
        sender_id: 'Arkesel',
        type: 'numeric'
    }, {
        headers: {
            'api-key': process.env.OTP_API_KEY
        }
    }).then(response => {
        res.json({ success: true, message: 'OTP sent successfully' });
    }).catch(error => {
        console.error('Error sending OTP:', error);
        res.json({ success: false, message: 'Failed to send OTP' });
    });
});

app.post('/api/auth/verify-otp', (req, res) => {
    const { otp, phoneNumber } = req.body;

    axios.post('https://sms.arkesel.com/api/otp/verify', {
        code: otp,
        number: phoneNumber
    }, {
        headers: {
            'api-key': process.env.OTP_API_KEY
        }
    }).then(response => {
        if (response.data.success) {
            res.json({ success: true, message: 'OTP verified successfully' });
        } else {
            res.json({ success: false, message: 'Invalid OTP' });
        }
    }).catch(error => {
        console.error('Error verifying OTP:', error);
        res.json({ success: false, message: 'Failed to verify OTP' });
    });
});

app.post('/api/auth/reset-password', (req, res) => {
    const { newPassword, phoneNumber } = req.body;

    pool.query('UPDATE midwives SET midwifepassword = $1 WHERE phone = $2', [newPassword, phoneNumber], (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            res.json({ success: false, message: 'Database error' });
            return;
        }
        res.json({ success: true, message: 'Password reset successfully' });
    });
});

app.post('/api/patients', checkAuth, (req, res) => {
    const { name, phone, language } = req.body;
    pool.query('INSERT INTO patients (patientname, patientphone, language, midwifeid) VALUES ($1, $2, $3, $4)', [name, phone, language, req.session.user.midwifeid], (error, results) => {
        if (error) {
            throw error;
        }
        res.json({ success: true });
    });
});

app.put('/api/patients/:id', checkAuth, (req, res) => {
    const id = req.params.id;
    const { name, phone, language } = req.body;
    pool.query('UPDATE patients SET patientname = $1, patientphone = $2, language = $3 WHERE patientid = $4', [name, phone, language, id], (error, results) => {
        if (error) {
            throw error;
        }
        res.json({ success: true });
    });
});

app.post('/api/appointments', checkAuth, (req, res) => {
    const { patientId, appointmentDate } = req.body;
    pool.query('INSERT INTO appointments (patientid, midwifeid, appointmentdate) VALUES ($1, $2, $3)', [patientId, req.session.user.midwifeid, appointmentDate], (error, results) => {
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

app.get('/api/appointments/next', checkAuth, (req, res) => {
    const midwifeId = req.session.user.midwifeid;
    pool.query(
        `SELECT a.appointmentdate, p.patientname, a.notes
         FROM appointments a
         JOIN patients p ON a.patientid = p.patientid
         WHERE a.midwifeid = $1 AND a.appointmentdate > NOW()
         ORDER BY a.appointmentdate ASC
         LIMIT 1`, [midwifeId], (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            res.json({ success: false, message: 'Database error' });
            return;
        }
        if (results.rows.length > 0) {
            res.json({ success: true, appointment: results.rows[0], midwifeName: req.session.user.firstname + ' ' + req.session.user.lastname });
        } else {
            res.json({ success: false, message: 'No upcoming appointments', midwifeName: req.session.user.firstname + ' ' + req.session.user.lastname });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
