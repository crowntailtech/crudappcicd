// Check login status on page load for restricted pages
function checkLoginStatus() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('You are not logged in. Redirecting to login page.');
    window.location.href = 'login.html';
  }
}

// Handle login submission
document.getElementById('login-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (!email || !password) {
    alert('Please fill in all fields.');
    return;
  }

  try {
    const response = await fetch('http://3.93.180.211:8000/api/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.user_id);
    alert('Login successful');
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Error during login:', error);
    alert(error.message || 'Login failed. Please try again.');
  }
});

// Handle signup submission
document.getElementById('signup-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value.trim();

  if (!name || !email || !password) {
    alert('Please fill in all fields.');
    return;
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    alert('Please enter a valid email address.');
    return;
  }

  try {
    const response = await fetch('http://3.93.180.211:8000/api/signup/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Signup failed');
    }

    alert('Signup successful. Please log in.');
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Error during signup:', error);
    alert(error.message || 'Signup failed. Please try again.');
  }
});

// Handle logout
function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  alert('You have been logged out.');
  window.location.href = 'login.html';
}
