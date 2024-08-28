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

const isWithinBusinessHours = (appointmentDate) => {
    const hours = appointmentDate.getHours();
    const minutes = appointmentDate.getMinutes();
    const time = hours * 60 + minutes; 

    const start = 6 * 60 + 30; // 6:30 AM in minutes
    const end = 19 * 60; // 7:00 PM in minutes

    return time >= start && time <= end;
};

const hasAppointmentClash = async (appointmentDate, midwifeId) => {
    const result = await pool.query(
        `SELECT COUNT(*) as count 
         FROM appointments 
         WHERE midwifeid = $1 
         AND appointmentdate = $2`,
        [midwifeId, appointmentDate]
    );

    return result.rows[0].count > 0;
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/home', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/calendar.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'calendar.html'));
});

app.post('/api/auth/login', (req, res) => {
    const { username, midwifePassword } = req.body; // Ensure this matches the client-side form fields
    console.log('Login attempt:', username, midwifePassword);

    pool.query('SELECT * FROM midwives WHERE LOWER(username) = LOWER($1) AND midwifePassword = $2', [username, midwifePassword], (error, results) => {
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

app.post('/api/appointments', checkAuth, async (req, res) => {
    const { patientId, appointmentDate, notes } = req.body;
    const midwifeId = req.session.user.midwifeid;
    const appointmentDateObj = new Date(appointmentDate);

    if (!isWithinBusinessHours(appointmentDateObj)) {
        return res.json({ success: false, message: 'Appointment time must be between 6:30 AM and 7:00 PM' });
    }

    if (await hasAppointmentClash(appointmentDate, midwifeId)) {
        return res.json({ success: false, message: 'Appointment time clashes with another appointment. Please choose a different time.' });
    }

    pool.query(
        'INSERT INTO appointments (patientid, appointmentdate, notes, midwifeid) VALUES ($1, $2, $3, $4) RETURNING *',
        [patientId, appointmentDate, notes, midwifeId],
        (error, results) => {
            if (error) {
                console.error('Error creating appointment:', error);
                res.json({ success: false, message: 'Database error' });
            } else {
                res.json({ success: true, appointment: results.rows[0] });
            }
        }
    );
});

app.get('/api/appointments', checkAuth, (req, res) => {
    const patientId = req.query.patientId;

    if (patientId) {
        // Fetch appointments for a specific patient
        pool.query(
            'SELECT * FROM appointments WHERE patientid = $1',
            [patientId],
            (error, results) => {
                if (error) {
                    console.error('Error retrieving appointments:', error);
                    return res.status(500).json({ success: false, message: 'Failed to retrieve appointments' });
                }

                res.json({ success: true, appointments: results.rows });
            }
        );
    } else {
        res.status(400).json({ success: false, message: 'No patient ID provided' });
    }
});

app.get('/api/appointments-calendar', checkAuth, (req, res) => {
    const midwifeId = req.session.user.midwifeid;
    pool.query(
        `SELECT a.appointmentid, a.appointmentdate, a.notes, p.patientname
         FROM appointments a
         JOIN patients p ON a.patientid = p.patientid
         WHERE a.midwifeid = $1`,
        [midwifeId], 
        (error, results) => {
            if (error) {
                console.error('Error fetching appointments:', error);
                res.json({ success: false, message: 'Database error' });
            } else {
                res.json({ success: true, appointments: results.rows });
            }
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
                const pregnancyStartDate = results.rows[0].pregnancy_start_date;
                if (pregnancyStartDate) {
                    const startDate = new Date(pregnancyStartDate);
                    const now = new Date();
                    const pregnancyDuration = 280; // typical pregnancy duration in days

                    const daysElapsed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
                    const progress = Math.min((daysElapsed / pregnancyDuration) * 100, 100);

                    res.json({ success: true, progress });
                } else {
                    res.json({ success: true, progress: null });
                }
            } else {
                res.json({ success: true, progress: null });
            }
        }
    );
});

app.get('/api/appointments', checkAuth, (req, res) => {
    const midwifeId = req.session.user.midwifeid;
    pool.query('SELECT * FROM appointments WHERE midwifeid = $1', [midwifeId], (error, results) => {
        if (error) {
            console.error('Error fetching appointments:', error);
            res.json({ success: false, message: 'Database error' });
        } else {
            res.json({ success: true, appointments: results.rows });
        }
    });
});

app.get('/api/patients', checkAuth, (req, res) => {
    const midwifeId = req.session.user.midwifeid;
    pool.query(
        `SELECT DISTINCT p.patientid, p.patientname, p.patientphone, p.language, p.medical_history, p.pregnancy_start_date
         FROM patients p
         JOIN appointments a ON p.patientid = a.patientid
         WHERE a.midwifeid = $1`,
        [midwifeId],
        (error, results) => {
            if (error) {
                console.error('Error fetching patients:', error);
                res.json({ success: false, message: 'Database error' });
            } else {
                res.json({ success: true, patients: results.rows });
            }
        }
    );
});

app.put('/api/patients/:id', async (req, res) => {
    const { id } = req.params;
    const { name, phone, language } = req.body;

    try {
        await pool.query('UPDATE patients SET patientname = $1, patientphone = $2, language = $3 WHERE patientid = $4', [name, phone, language, id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating patient:', err);
        res.status(500).json({ success: false, message: 'Error updating patient' });
    }
});


app.put('/api/appointments/:id', async (req, res) => {
    const { id } = req.params;
    const { newDate } = req.body;
    const midwifeId = req.session.user.midwifeid; 

    const appointmentDate = new Date(newDate);

    if (!isWithinBusinessHours(appointmentDate)) {
        return res.status(400).json({ success: false, message: 'Appointment is outside business hours' });
    }

    if (await hasAppointmentClash(appointmentDate, midwifeId)) {
        return res.status(400).json({ success: false, message: 'Appointment clashes with another appointment' });
    }

    try {
        await pool.query('UPDATE appointments SET appointmentdate = $1 WHERE appointmentid = $2', [newDate, id]);
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating appointment:', err);
        res.status(500).json({ success: false, message: 'Error updating appointment' });
    }
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
