// Function to fetch books via API
async function fetchBooks() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Unauthorized: No token found. Redirecting to login.');
    }

    const response = await fetch('http://3.93.180.211:8000/api/books/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Please log in again.');
      } else {
        throw new Error('Failed to fetch books. Please try again later.');
      }
    }

    const books = await response.json();
    displayBooks(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    alert(error.message);
    if (error.message.includes('Unauthorized')) {
      handleLogout();
    }
  }
}

// Function to display books dynamically
function displayBooks(books) {
  const bookList = document.getElementById('book-list');
  bookList.innerHTML = ''; // Clear existing content

  if (books.length === 0) {
    bookList.innerHTML = '<p>No books available.</p>';
    return;
  }

  books.forEach((book) => {
    const bookBox = document.createElement('div');
    const imageUrl = book.image ? `http://3.93.180.211:8000${book.image}` : 'placeholder.png';
    bookBox.className = 'book-box';
    bookBox.innerHTML = `
      <img src="${imageUrl}" alt="${book.title}" class="book-image" />
      <h3>${book.title}</h3>
      <p><strong>Author:</strong> ${book.author}</p>
      <p><strong>Assigned to:</strong> ${book.assigned_to || 'None'}</p>
    `;
    bookList.appendChild(bookBox);
  });
}

// Check login status
function checkLoginStatus() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('You are not logged in. Redirecting to login page.');
    window.location.href = 'login.html';
    return null;
  }
  return token;
}

// Update Navbar
async function updateNavbar() {
  const userWelcome = document.getElementById('user-welcome');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  if (token) {
    try {
      const response = await fetch(`http://3.93.180.211:8000/api/profile/${userId}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        localStorage.setItem('userName', user.name);
        userWelcome.textContent = `Welcome, ${user.name}`;
      } else {
        userWelcome.textContent = 'Welcome, User';
      }
    } catch (error) {
      userWelcome.textContent = 'Welcome, User';
    }

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
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  alert('You have been logged out.');
  window.location.href = 'login.html';
}

document.getElementById('logout-btn')?.addEventListener('click', () => {
  handleLogout();
});

// Initialize page
window.onload = () => {
  const token = checkLoginStatus();
  if (token) {
    fetchBooks();
  }
  updateNavbar();
};
