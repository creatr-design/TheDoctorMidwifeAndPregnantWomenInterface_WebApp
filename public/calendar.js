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
    fetch('/api/appointments-calendar')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const appointments = data.appointments;
                const calendarDiv = document.getElementById('calendar');

                let table = '<table>';
                table += '<tr><th>Time</th>';
                for (let i = 0; i < 7; i++) {
                    const date = new Date();
                    date.setDate(date.getDate() + i);
                    const day = date.toLocaleString('default', { weekday: 'short' });
                    const formattedDate = `${day}, ${date.getDate()}-${date.toLocaleString('default', { month: 'short' })}`;
                    table += `<th>${formattedDate}</th>`;
                }
                table += '</tr>';

                const startHour = 6;
                const startMinute = 30;
                const endHour = 19;
                const endMinute = 0;

                for (let hour = startHour; hour <= endHour; hour++) {
                    for (let minute = (hour === startHour ? startMinute : 0); minute < 60; minute += 30) {
                        if (hour === endHour && minute > endMinute) break;

                        table += '<tr>';
                        table += `<td>${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}</td>`;
                        for (let i = 0; i < 7; i++) {
                            const date = new Date();
                            date.setDate(date.getDate() + i);
                            date.setHours(hour, minute, 0, 0);

                            const appointment = appointments.find(a => {
                                const appointmentDate = new Date(a.appointmentdate);
                                return appointmentDate.getFullYear() === date.getFullYear() &&
                                       appointmentDate.getMonth() === date.getMonth() &&
                                       appointmentDate.getDate() === date.getDate() &&
                                       appointmentDate.getHours() === date.getHours() &&
                                       appointmentDate.getMinutes() === date.getMinutes();
                            });

                            table += `<td>${appointment ? `ID: ${appointment.appointmentid}<br>${appointment.patientname}` : ''}</td>`;
                        }
                        table += '</tr>';
                    }
                }

                table += '</table>';

                calendarDiv.innerHTML = table;
            } else {
                document.getElementById('calendar').innerText = 'No appointments available';
            }
        });
});