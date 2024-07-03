const express = require('express');
const sql = require('mssql');
const router = express.Router();

// Add a new patient
router.post('/', (req, res) => {
    const { patientName, patientPhoneNumber } = req.body;
    const query = `INSERT INTO Patients (PatientName, PatientPhoneNumber) VALUES (@patientName, @patientPhoneNumber)`;

    const request = new sql.Request();
    request.input('patientName', sql.VarChar, patientName);
    request.input('patientPhoneNumber', sql.VarChar, patientPhoneNumber);

    request.query(query, (err, result) => {
        if (err) {
            console.error('Failed to create patient:', err);
            res.status(500).send('Error creating patient');
        } else {
            res.status(201).send('Patient created successfully');
        }
    });
});

// Update patient details
router.post('/update', (req, res) => {
    const { patientID, patientName, patientPhoneNumber } = req.body;
    const query = `UPDATE Patients SET PatientName = @patientName, PatientPhoneNumber = @patientPhoneNumber WHERE PatientID = @patientID`;

    const request = new sql.Request();
    request.input('patientID', sql.Int, patientID);
    request.input('patientName', sql.VarChar, patientName);
    request.input('patientPhoneNumber', sql.VarChar, patientPhoneNumber);

    request.query(query, (err, result) => {
        if (err) {
            console.error('Failed to update patient:', err);
            res.status(500).send('Error updating patient');
        } else {
            res.status(200).send('Patient updated successfully');
        }
    });
});

module.exports = router;
