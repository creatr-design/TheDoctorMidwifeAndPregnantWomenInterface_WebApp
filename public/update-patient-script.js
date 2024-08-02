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

document.getElementById('updatePatientForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const id = document.getElementById('patientId').value;
    const name = document.getElementById('patientName').value;
    const phone = document.getElementById('patientPhone').value;
    const language = document.getElementById('patientLanguage').value;

    fetch(`/api/patients/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, phone, language })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('result').innerText = 'Patient details updated successfully!';
        } else {
            document.getElementById('result').innerText = 'Error updating patient details.';
        }
    });
});

document.getElementById('rescheduleAppointmentForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const id = document.getElementById('appointmentId').value;
    const newDate = document.getElementById('newDate').value;

    fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newDate })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('result').innerText = 'Appointment rescheduled successfully!';
        } else {
            document.getElementById('result').innerText = 'Error rescheduling appointment.';
        }
    });
});