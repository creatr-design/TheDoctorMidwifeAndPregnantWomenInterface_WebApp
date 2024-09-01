# Appointment Management System

Overview

This is a web-based application designed to facilitate communication between healthcare providers (midwives and doctors) and pregnant women, especially in remote areas. The system enables scheduling, managing, and tracking appointments while providing vital information to pregnant women to ensure their well-being throughout the pregnancy.

Features

- User Authentication:
  - Secure login for doctors and midwives.
  - Role-based access control to ensure appropriate data access.
  
- Appointment Scheduling:
  - Create, update, and delete appointments.
  - View scheduled appointments in a calendar view.
  - Automated reminders and notifications for upcoming appointments.

- Patient Management:
  - Add, update, and manage patient records.
  - Track medical history and pregnancy progress.
  
- Communication:
  - Secure messaging system for communication between healthcare providers and pregnant women.
  - Pre-recorded calls for appointment reminders, particularly for patients who may have difficulty reading.
  
- Pregnancy Monitoring:
  - Track pregnancy start dates and display progress.
  - Display pregnancy start date information, or provide an alternate message if not available.

- User Interface:
  - Responsive design compatible with both desktop and mobile devices.
  - Intuitive and user-friendly interface designed for ease of use by healthcare providers.

Installation

#Prerequisites

- [Node.js](https://nodejs.org/) (version 12.x or higher)
- [npm](https://www.npmjs.com/) (Node Package Manager)
- A database server (e.g., PostgreSQL)
- [Git](https://git-scm.com/)

#Steps

1. Clone the repository:
   ```
   git clone (https://github.com/creatr-design/appointment_system.git)
   cd appointment_system
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database:
   - Create a PostgreSQL database.
   - Run the database schema file to create the required tables:
     ```
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
         language VARCHAR(10) NOT NULL,
         medical_history TEXT
     );
     
     CREATE TABLE appointments (
         appointmentid SERIAL PRIMARY KEY,
         patientid INT REFERENCES patients(patientid),
         appointment_date TIMESTAMP NOT NULL,
         notes TEXT,
         pregnancy_start_date DATE
     );
     ```

4. Configure environment variables:
   - Create a `.env` file in the root directory and add the following:
     ```
     DB_HOST=your_database_host
     DB_USER=your_database_user
     DB_PASSWORD=your_database_password
     DB_NAME=your_database_name
     ```

5. Run the application:
   ```
   npm start
   ```

6. Access the application:
   - Open a web browser and navigate to `http://localhost:3000`.

Usage

1. Login:
   - Midwives and doctors can log in using their credentials.
   
2. Appointment Management:
   - Schedule and manage appointments through the interface.
   - View upcoming appointments on the calendar page.

3. Patient Management:
   - Add new patients and track their pregnancy progress.
   - Record medical history and view past appointments.

4. Communication:
   - Use the secure messaging system for communication with patients.
   - Set up pre-recorded calls for appointment reminders.

Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/YourFeature`).
3. Commit your changes (`git commit -m 'Add your feature'`).
4. Push to the branch (`git push origin feature/YourFeature`).
5. Open a pull request.

Contact

For any inquiries or support, please contact:
- Email: carlnktmensah@gmail.com
- GitHub: [creatr-design](https://github.com/creatr-design)

---

This `README.md` should give users and developers a clear understanding of the project, how to set it up, and how to contribute.
