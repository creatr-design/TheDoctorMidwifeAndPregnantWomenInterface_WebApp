document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const midwifePassword = document.getElementById('midwifePassword').value;

    fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, midwifePassword })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = data.redirect;
        } else {
            document.getElementById('result').innerText = data.message;
        }
    })
    .catch(error => {
        document.getElementById('result').innerText = 'Error logging in';
        console.error('Error:', error);
    });
});
