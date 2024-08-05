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

document.getElementById('addPatientForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('patientName').value;
    const phone = document.getElementById('patientPhone').value;
    const language = document.getElementById('patientLanguage').value;

    fetch('/api/patients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, phone, language })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('result').innerText = 'Patient added successfully!';
        } else {
            document.getElementById('result').innerText = 'Error adding patient.';
        }
    });
});