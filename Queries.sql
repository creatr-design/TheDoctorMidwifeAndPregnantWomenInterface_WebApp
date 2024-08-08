select * from midwives;
select * from patients;
select * from appointments
WHERE patientid = '3';

UPDATE patients
SET language = 'Hausa'
WHERE patientid = '3' AND appointmentid ='3';

SELECT p.patientphone, a.appointmentid, p.sms_type, p.language
FROM appointments a 
JOIN patients p ON a.patientid = p.patientid
WHERE appointmentdate::date = CURRENT_DATE + INTERVAL '1 day';

SELECT * FROM midwives WHERE LOWER(username) = LOWER('nbrown');

INSERT INTO appointments (patientid, midwifeid, appointmentdate, status, notes) VALUES
(1, 1, '2024-07-20 10:00:00', 'Scheduled', 'Initial checkup'),
(2, 2, '2024-07-21 11:00:00', 'Scheduled', 'Follow-up visit'),
(3, 3, '2024-07-22 12:00:00', 'Scheduled', 'Routine checkup'),
(4, 4, '2024-07-23 13:00:00', 'Scheduled', 'Blood test'),
(5, 5, '2024-07-24 14:00:00', 'Scheduled', 'Ultrasound'),
(6, 1, '2024-07-25 15:00:00', 'Scheduled', 'Glucose screening'),
(7, 2, '2024-07-26 16:00:00', 'Scheduled', 'Anomaly scan'),
(8, 3, '2024-07-27 17:00:00', 'Scheduled', 'Blood pressure check'),
(9, 4, '2024-07-28 18:00:00', 'Scheduled', 'Diabetes screening'),
(10, 5, '2024-07-29 09:00:00', 'Scheduled', 'Final checkup');


ALTER TABLE patients ADD COLUMN pregnancy_start_date DATE;

SELECT p.patientphone, a.appointmentid, p.sms_type, p.language
FROM appointments a 
JOIN patients p ON a.patientid = p.patientid
WHERE appointmentdate::date = CURRENT_DATE + INTERVAL '1 day';
