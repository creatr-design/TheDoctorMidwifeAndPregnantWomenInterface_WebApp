function openSidebar() {
    document.getElementById("sidebar").classList.add("active");
}

function closeSidebar() {
    document.getElementById("sidebar").classList.remove("active");
}

function logout() {
    fetch('/api/auth/logout', {
        method: 'POST',
    }).then(response => response.json()).then(data => {
        if (data.success) {
            window.location.href = '/';
        } else {
            alert('Logout failed');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/midwife')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('midwifeName').innerText = data.midwifeName + '!';
            }
        });

    fetch('/api/appointments/next')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const appointment = data.appointment;
                const detailsDiv = document.getElementById('appointmentDetails');
                const appointmentDate = new Date(appointment.appointmentdate);
                detailsDiv.innerHTML = `
                    <p><strong>Appointment Date:</strong> ${appointmentDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    <p><strong>Patient Name:</strong> ${appointment.patientname}</p>
                    <p><strong>Notes:</strong> ${appointment.notes}</p>
                `;
                document.getElementById('appointmentCount').innerText = data.appointmentsToday;
            } else {
                document.getElementById('appointmentDetails').innerText = 'No upcoming appointments';
                document.getElementById('appointmentCount').innerText = 0;
            }
        });

    fetch('/api/pregnancy-progress')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('pregnancyContainer');
            const weeksText = document.getElementById('pregnancyWeeks');
            if (data.success) {
                if (data.progress !== null) {
                    const progressBar = document.getElementById('pregnancyProgress');
                    progressBar.style.width = data.progress + '%';
                    const weeksElapsed = Math.floor(data.progress / 100 * 40);
                    weeksText.innerText = `Weeks into pregnancy: ${weeksElapsed}`;
                } else {
                    container.innerHTML = '<p>Pregnancy start date not available</p>';
                }
            } else {
                container.innerHTML = '<p>Pregnancy start date not available</p>';
            }
        });
});

document.getElementById('createAppointmentForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    fetch('/api/appointments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            const resultDiv = document.getElementById('result');
            if (data.success) {
                resultDiv.innerText = 'Appointment created successfully';
            } else {
                resultDiv.innerText = 'Error: ' + data.message;
            }
        });
});