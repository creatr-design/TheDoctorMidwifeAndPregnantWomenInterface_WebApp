const express = require('express');
const router = express.Router();

// Mock authentication for simplicity
router.post('/login', (req, res) => {
    const { midwifeName, midwifePassword } = req.body;

    // Replace with actual authentication logic
    if (midwifeName === 'midwife' && midwifePassword === 'password') {
        req.session.midwifeName = midwifeName;
        res.status(200).send('Login successful');
    } else {
        res.status(401).send('Invalid credentials');
    }
});

// Logout route
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Logout failed');
        }
        res.status(200).send('Logout successful');
    });
});

module.exports = router;
