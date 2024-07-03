const express = require('express');
const sql = require('mssql');
const router = express.Router();

// Create a new appointment
router.post('/', (req, res) => {
    const { midwifeID, patientID, appointmentDate } = req.body;
    const query = `
        INSERT INTO Appointments (MidwifeID, PatientID, AppointmentDate, Status)
        VALUES (@midwifeID, @patientID, @appointmentDate, 'Scheduled')`;

    const request = new sql.Request();
    request.input('midwifeID', sql.Int, midwifeID);
    request.input('patientID', sql.Int, patientID);
    request.input('appointmentDate', sql.DateTime, appointmentDate);

    request.query(query, (err, result) => {
        if (err) {
            console.error('Insert failed:', err);
            res.status(500).send('Error saving appointment');
        } else {
            res.status(200).send('Appointment saved successfully');
        }
    });
});

// Get scheduled appointments
router.get('/', (req, res) => {
    const query = "SELECT * FROM Appointments WHERE Status = 'Scheduled'";
    sql.query(query, (err, result) => {
        if (err) {
            console.error('Query failed:', err);
            res.status(500).send('Error retrieving appointments');
        } else {
            res.status(200).json(result.recordset);
        }
    });
});

// Update appointment status
router.post('/updateStatus', (req, res) => {
    const { appointmentID, status } = req.body;
    const query = "UPDATE Appointments SET Status = @status WHERE AppointmentID = @appointmentID";

    const request = new sql.Request();
    request.input('status', sql.VarChar, status);
    request.input('appointmentID', sql.Int, appointmentID);

    request.query(query, (err, result) => {
        if (err) {
            console.error('Update failed:', err);
            res.status(500).send('Error updating appointment status');
        } else {
            res.status(200).send('Appointment status updated successfully');
        }
    });
});

module.exports = router;
