// Fetch and display profile details
async function fetchProfile() {
  try {
    const token = localStorage.getItem('token'); // Retrieve token
    const userId = localStorage.getItem('userId'); // Retrieve user ID

    if (!token || !userId) {
      throw new Error('Unauthorized: No token or user ID found.');
    }

    const response = await fetch(`http://3.93.180.211:8000/api/profile/${userId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Include token in headers
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Please log in again.');
      } else if (response.status === 403) {
        throw new Error('Forbidden: Access denied.');
      } else {
        throw new Error('Failed to fetch profile.');
      }
    }

    const profile = await response.json();
    displayProfile(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    alert(error.message);
    if (error.message.includes('Unauthorized')) {
      handleLogout(); // Redirect to login if unauthorized
    }
  }
}

// Display profile details
function displayProfile(profile) {
  const profileDetails = document.getElementById('profile-details');
  profileDetails.innerHTML = `
    <p><strong>Name:</strong> ${profile.name}</p>
    <p><strong>Email:</strong> ${profile.email}</p>
    <p><strong>City:</strong> ${profile.city || 'N/A'}</p>
    <p><strong>Country:</strong> ${profile.country || 'N/A'}</p>
  `;
}

// Update profile details
document.getElementById('update-profile-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const token = localStorage.getItem('token'); // Retrieve token
  const userId = localStorage.getItem('userId'); // Retrieve user ID

  if (!token || !userId) {
    alert('Unauthorized: Please log in again.');
    handleLogout(); // Redirect to login
    return;
  }

  const updatedData = {
    name: document.getElementById('update-name').value.trim(),
    city: document.getElementById('update-city').value.trim(),
    country: document.getElementById('update-country').value.trim(),
  };

  try {
    const response = await fetch(`http://3.93.180.211:8000/api/profile/${userId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile.');
    }

    alert('Profile updated successfully.');
    fetchProfile(); // Refresh profile details
  } catch (error) {
    console.error('Error updating profile:', error);
    alert(error.message || 'Failed to update profile.');
  }
});

// Check login status
function checkLoginStatus() {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  if (!token || !userId) {
    alert('You are not logged in. Redirecting to login page.');
    window.location.href = 'login.html';
    return null;
  }
  return { token, userId };
}

// Update Navbar
function updateNavbar() {
  const userWelcome = document.getElementById('user-welcome');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const token = localStorage.getItem('token');

  if (token) {
    const loggedInUser = localStorage.getItem('userName');
    userWelcome.textContent = `Welcome, ${loggedInUser}`;
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-block';
  } else {
    userWelcome.textContent = '';
    loginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
  }
}

// Handle logout
function handleLogout() {
  localStorage.removeItem('token'); // Remove token
  localStorage.removeItem('userId'); // Remove user ID
  alert('You have been logged out.');
  window.location.href = 'login.html'; // Redirect to login page
}

// Initialize page
window.onload = () => {
  const { token, userId } = checkLoginStatus();
  if (token && userId) {
    fetchProfile(); // Fetch profile only if logged in
  }
  updateNavbar();
};

document.getElementById('logout-btn')?.addEventListener('click', () => {
  handleLogout();
});