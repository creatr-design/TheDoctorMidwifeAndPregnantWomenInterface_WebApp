function openSidebar() {
  document.getElementById("sidebar").classList.add("active");
}

function closeSidebar() {
  document.getElementById("sidebar").classList.remove("active");
}

function logout() {
  fetch("/api/auth/logout", {
      method: "POST",
  })
      .then((response) => response.json())
      .then((data) => {
          if (data.success) {
              window.location.href = "/";
          } else {
              alert("Logout failed");
          }
      });
}

function searchPatients() {
  const input = document.getElementById("searchInput");
  const filter = input.value.toLowerCase();
  const rows = document
      .getElementById("patientsList")
      .getElementsByTagName("tr");

  for (let i = 0; i < rows.length; i++) {
      const nameCell = rows[i].getElementsByTagName("td")[1];
      const idCell = rows[i].getElementsByTagName("td")[0];
      if (nameCell || idCell) {
          const nameText = nameCell.textContent || nameCell.innerText;
          const idText = idCell.textContent || idCell.innerText;
          if (
              nameText.toLowerCase().indexOf(filter) > -1 ||
              idText.toLowerCase().indexOf(filter) > -1
          ) {
              rows[i].style.display = "";
          } else {
              rows[i].style.display = "none";
          }
      }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  fetch("/api/patients")
      .then((response) => response.json())
      .then((data) => {
          if (data.success) {
              const patients = data.patients;
              const patientsListDiv = document.getElementById("patientsList");

              let table = "<table>";
              table += "<tr><th>ID</th><th>Name</th><th>Phone</th><th>Language</th><th>Medical History</th><th>Estimated Conception Date</th><th>Actions</th></tr>";

              patients.forEach((patient) => {
                  const pregnancyStartDate = patient.pregnancy_start_date
                      ? new Date(patient.pregnancy_start_date).toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "long", year: "numeric" }
                        )
                      : "N/A";
                  table += `<tr>
                              <td>${patient.patientid}</td>
                              <td>${patient.patientname}</td>
                              <td>${patient.patientphone}</td>
                              <td>${patient.language}</td>
                              <td>${patient.medical_history}</td>
                              <td>${pregnancyStartDate}</td>
                              <td><button onclick="showAppointments(${patient.patientid})">View Appointments</button></td>
                            </tr>`;
              });

              table += "</table>";
              patientsListDiv.innerHTML = table;
          } else {
              document.getElementById("patientsList").innerText =
                  "No patients available";
          }
      });
});

function showAppointments(patientId) {
  fetch(`/api/appointments?patientId=${patientId}`)
      .then((response) => response.json())
      .then((data) => {
          const appointmentsListDiv = document.getElementById("appointmentsList");
          if (data.success) {
              const appointments = data.appointments;
              let table = "<h2 align='center'>Appointments List</h2>";
              table += "<table>";
              table += "<tr><th>Appointment ID</th><th>Date</th><th>Time</th><th>Notes</th></tr>";

              appointments.forEach((appointment) => {
                  const appointmentDate = new Date(appointment.appointmentdate);
                  const formattedDate = appointmentDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
                  const formattedTime = appointmentDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

                  table += `<tr>
                              <td>${appointment.appointmentid}</td>
                              <td>${formattedDate}</td>
                              <td>${formattedTime}</td>
                              <td>${appointment.notes}</td>
                            </tr>`;
              });

              table += "</table>";
              appointmentsListDiv.innerHTML = table;
          } else {
              appointmentsListDiv.innerText = "No appointments available for this patient.";
          }
      });
}
