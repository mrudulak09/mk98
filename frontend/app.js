const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

const BASE_URL = "http://localhost:5000/auth"; // Base URL for API



// Toggle between sign-up and sign-in forms
sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

// Helper function to send API requests
async function sendRequest(url, method, data) {
  console.log(`Sending ${method} request to ${url} with data:`, data);
  const response = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorMessage = await response.text(); // Get the error message
    console.error('Error during API request:', errorMessage);
    throw new Error(errorMessage);
  }

  const result = await response.json();
  return result;
}

// Handle sign-in form submission
document.querySelector(".sign-in-form").addEventListener("submit", async function (e) {
  e.preventDefault(); // Prevent default form submission

  const username = document.querySelector('.sign-in-form input[type="text"]').value;
  const password = document.querySelector('.sign-in-form input[type="password"]').value;

  if (username && password) {
    try {
      const result = await sendRequest(`${BASE_URL}/login`, "POST", {
        username,
        password,
      });

      alert("Login Successful!");
      localStorage.setItem('token', result.token); // Store token
      window.location.href = "dashboard.html"; // Redirect to dashboard
    } catch (error) {
      alert(error.message);
    }
  } else {
    alert("Please enter a valid username and password");
  }
});

// Handle sign-up form submission
document.querySelector(".sign-up-form").addEventListener("submit", async function (e) {
  e.preventDefault(); // Prevent default form submission

  const username = document.querySelector('.sign-up-form input[type="text"]').value;
  const email = document.querySelector('.sign-up-form input[type="email"]').value;
  const password = document.querySelector('.sign-up-form input[type="password"]').value;

  if (username && email && password) {
    try {
      const result = await sendRequest(`${BASE_URL}/signup`, "POST", {
        username,
        email,
        password,
      });

      alert("Sign-up Successful!");
      // Redirect to the dashboard after sign-up
      window.location.href = "dashboard.html"; // Change this line if needed
    } catch (error) {
      alert(error.message);
    }
  } else {
    alert("Please fill in all fields");
  }
});


// Function to create a new note card
function createNoteCard(title, subject) {
  const noteCard = document.createElement("div");
  noteCard.className = "note-card";
  noteCard.innerHTML = `
      <h3>${title}</h3>
      <p>Click to view or download.</p>
      <a href="note-details.html">View Details</a>
      <button class="edit-btn" onclick="editNotePrompt(this)">Edit</button>
      <button class="delete-btn" onclick="deleteNotePrompt(this)">Delete</button>
  `;
  document.getElementById(`${subject}-notes`).appendChild(noteCard);
}

// Function to delete a note
function deleteNotePrompt(button) {
  if (confirm("Are you sure you want to delete this note?")) {
    const noteCard = button.parentElement;
    noteCard.remove();
  }
}

// Function to edit a note
function editNotePrompt(button) {
  const noteCard = button.parentElement;
  const noteTitle = noteCard.querySelector("h3").innerText;
  const newTitle = prompt("Edit the note title:", noteTitle);
  if (newTitle) {
    noteCard.querySelector("h3").innerText = newTitle;
  }
}

// Function to prompt user for note title
function addNotePrompt(subject) {
  const title = prompt("Enter the title of the note:");
  if (title) {
    createNoteCard(title, subject);
  }
}

// Navigation functions
function showHome() {
  document.getElementById("main-content").innerHTML = `
      <header>
          <h1>Welcome to NotesBuzz</h1>
          <p>Your platform for sharing and discovering notes!</p>
      </header>
      <section class="info-image">
          <img src="images/information.jpg" alt="Information" />
          <p>Discover a wealth of knowledge and resources shared by fellow students.</p>
      </section>
  `;
  setActiveLink("Home");
}

function showOverview() {
  document.getElementById("main-content").innerHTML = `
      <header>
          <h1>Overview</h1>
          <p>This section will provide an overview of your notes.</p>
      </header>
  `;
  setActiveLink("Overview");
}

function showProfile() {
  document.getElementById("main-content").innerHTML = `
      <header>
          <h1>Profile</h1>
          <p>Your profile details and information.</p>
      </header>
  `;
  setActiveLink("Profile");
}

function showSettings() {
  document.getElementById("main-content").innerHTML = `
      <header>
          <h1>Settings</h1>
          <p>Adjust your settings and preferences here.</p>
      </header>
  `;
  setActiveLink("Settings");
}

function logOut() {
  alert("Logged out successfully!");
  localStorage.removeItem('token'); // Remove token on logout
  window.location.href = "index.html"; // Redirect to the homepage
}

function setActiveLink(link) {
  const links = document.querySelectorAll(".nav_link");
  links.forEach((l) => {
    l.classList.remove("active");
    if (l.textContent.trim() === link) {
      l.classList.add("active");
    }
  });
}

// Load the home content on clicking the Home link
document.getElementById("homeLink").addEventListener("click", function () {
  showHome();
});
