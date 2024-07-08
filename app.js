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
    const midwifeId = req.session.user.midwifeid;

    const query = `
        SELECT a.appointmentdate, p.patientname, a.notes
        FROM appointments a
        JOIN patients p ON a.patientid = p.patientid
        WHERE a.midwifeid = $1 AND a.appointmentdate > NOW()
        ORDER BY a.appointmentdate ASC
        LIMIT 1
    `;

    pool.query(query, [midwifeId], (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            res.sendFile(path.join(__dirname, 'public', 'home.html')); // Sending the home page without dynamic data
        } else {
            const appointment = results.rows[0] || { patientname: 'No appointments', appointmentdate: null, notes: 'No notes available' };
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Home</title>
                    <link rel="stylesheet" href="styles.css">
                </head>
                <body>
                    <div class="container">
                        <div class="navbar">
                            <span class="burger" onclick="openSidebar()">☰</span>
                            <span class="welcome-message">Hello, ${req.session.user.midwifename}</span>
                        </div>
                        <div class="sidebar" id="sidebar">
                            <a href="javascript:void(0)" class="closebtn" onclick="closeSidebar()">×</a>
                            <a href="/home">Home</a>
                            <a href="/add-patient">Add Patient</a>
                            <a href="/update-patient">Update Patient</a>
                            <a href="/create-appointment">Create Appointment</a>
                            <a href="/update-appointment">Update Appointment</a>
                            <a href="#" onclick="logout()">Logout</a>
                        </div>
                        <div class="main-content">
                            <h1>Next Appointment</h1>
                            <p>Patient: ${appointment.patientname}</p>
                            <p>Date: ${appointment.appointmentdate ? new Date(appointment.appointmentdate).toLocaleString() : 'No upcoming appointments'}</p>
                            <p>Notes: ${appointment.notes || 'No notes available'}</p>
                        </div>
                    </div>
                    <script>
                        function openSidebar() {
                            document.getElementById("sidebar").style.width = "250px";
                        }

                        function closeSidebar() {
                            document.getElementById("sidebar").style.width = "0";
                        }

                        function logout() {
                            fetch('/api/auth/logout', { method: 'POST' })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.success) {
                                        window.location.href = '/';
                                    }
                                });
                        }
                    </script>
                </body>
                </html>
            `);
        }
    });
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

app.get('/add-patient', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'add-patient.html'));
});

app.get('/update-patient', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'update-patient.html'));
});

app.get('/create-appointment', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'create-appointment.html'));
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
    res.json({
        midwifeid: req.session.user.midwifeid,
        midwifename: req.session.user.midwifename
    });
});

app.get('/api/appointments/next', checkAuth, (req, res) => {
    const midwifeId = req.session.user.midwifeid;
    pool.query(
        `SELECT a.*, p.name as patientname 
         FROM appointments a 
         JOIN patients p ON a.patientid = p.patientid 
         WHERE a.midwifeid = $1 AND a.appointmentdate > NOW() 
         ORDER BY a.appointmentdate ASC 
         LIMIT 1`, 
        [midwifeId], 
        (error, results) => {
            if (error) {
                console.error('Database query error:', error);
                res.json({ success: false, message: 'Database error' });
                return;
            }
            res.json(results.rows[0] || null);
        }
    );
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
