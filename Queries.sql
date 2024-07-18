DROP TABLE IF EXISTS midwives CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;

CREATE TABLE midwives (
    midwifeid SERIAL PRIMARY KEY,
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    midwifepassword VARCHAR(100) NOT NULL,
    midwifephone VARCHAR(15) NOT NULL
);

CREATE TABLE patients (
    patientid SERIAL PRIMARY KEY,
    patientname VARCHAR(100) NOT NULL,
    patientphone VARCHAR(15) NOT NULL,
    midwifeid INT REFERENCES midwives(midwifeid),
    language VARCHAR(10) NOT NULL
);

CREATE TABLE appointments (
    appointmentid SERIAL PRIMARY KEY,
    patientid INT REFERENCES patients(patientid),
    midwifeid INT REFERENCES midwives(midwifeid),
    appointmentdate TIMESTAMP NOT NULL,
    status VARCHAR(50),
    notes TEXT
);

INSERT INTO midwives (firstname, lastname, username, midwifepassword, midwifephone) VALUES
('Mary', 'Adams', LOWER(CONCAT(SUBSTRING('Mary', 1, 1), 'Adams')), 'password123', '555-555-5551'),
('Nina', 'Brown', LOWER(CONCAT(SUBSTRING('Nina', 1, 1), 'Brown')), 'password123', '555-555-5552'),
('Olivia', 'Clark', LOWER(CONCAT(SUBSTRING('Olivia', 1, 1), 'Clark')), 'password123', '555-555-5553'),
('Paula', 'Davis', LOWER(CONCAT(SUBSTRING('Paula', 1, 1), 'Davis')), 'password123', '555-555-5554'),
('Quinn', 'Evans', LOWER(CONCAT(SUBSTRING('Quinn', 1, 1), 'Evans')), 'password123', '555-555-5555');

INSERT INTO patients (patientname, patientphone, midwifeid, language) VALUES
('Alice Johnson', '123-456-7890', 1, 'Ga'),
('Bob Smith', '987-654-3210', 2, 'Ewe'),
('Cathy Lee', '555-123-4567', 3, 'English'),
('David Brown', '444-555-6666', 4, 'Twi'),
('Eva Green', '222-333-4444', 5, 'Hausa'),
('Frank White', '333-444-5555', 1, 'Ga'),
('Grace Black', '666-777-8888', 2, 'Ewe'),
('Henry Silver', '777-888-9999', 3, 'English'),
('Isla Gold', '888-999-0000', 4, 'Twi'),
('Jack Blue', '999-000-1111', 5, 'Hausa');

INSERT INTO appointments (patientid, midwifeid, appointmentdate, status, notes) VALUES
(1, 1, '2024-07-11 10:00:00', 'Scheduled', 'Initial checkup'),
(2, 2, '2024-07-12 11:00:00', 'Scheduled', 'Follow-up visit'),
(3, 3, '2024-07-13 12:00:00', 'Scheduled', 'Routine checkup'),
(4, 4, '2024-07-14 13:00:00', 'Scheduled', 'Blood test'),
(5, 5, '2024-07-15 14:00:00', 'Scheduled', 'Ultrasound'),
(6, 1, '2024-07-16 15:00:00', 'Scheduled', 'Glucose screening'),
(7, 2, '2024-07-17 16:00:00', 'Scheduled', 'Anomaly scan'),
(8, 3, '2024-07-18 17:00:00', 'Scheduled', 'Blood pressure check'),
(9, 4, '2024-07-19 18:00:00', 'Scheduled', 'Diabetes screening'),
(10, 5, '2024-07-10 09:00:00', 'Scheduled', 'Final checkup');

select * from patients;

