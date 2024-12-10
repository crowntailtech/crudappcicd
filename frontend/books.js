// Fetch Books from API
async function fetchBooks() {
  try {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (!token) throw new Error('Unauthorized: Please log in again.');

    const response = await fetch('http://127.0.0.1:8000/api/books/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch books.');
    }

    const books = await response.json();
    displayBooks(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    alert(error.message || 'Failed to fetch books.');
    if (error.message.includes('Unauthorized')) {
      handleLogout(); // Redirect to login if unauthorized
    }
  }
}

// Display Books
function displayBooks(books) {
  const bookList = document.getElementById('book-list');
  bookList.innerHTML = ''; // Clear any existing content

  books.forEach((book) => {
    const bookBox = document.createElement('div');
    bookBox.className = 'book-box';

    // Prepend base URL to the image path
    const imageUrl = book.image ? `http://127.0.0.1:8000${book.image}` : 'placeholder.png';

    bookBox.innerHTML = `
      <img src="${imageUrl}" alt="${book.title}" />
      <h3>${book.title}</h3>
      <p>Author: ${book.author}</p>
      <p>Assigned to: ${book.assigned_to || 'None'}</p>
      <button onclick="showEditForm(${book.id}, '${book.title}', '${book.author}')">Edit</button>
      <button onclick="deleteBook(${book.id})">Delete</button>
      <button onclick="showAssignForm(${book.id}, '${book.title}')">Assign</button>
    `;
    bookList.appendChild(bookBox);
  });
}

document.getElementById('logout-btn')?.addEventListener('click', () => {
  handleLogout();
});

// Show Edit Form
function showEditForm(bookId, bookTitle, bookAuthor) {
  document.getElementById('edit-book-form').style.display = 'block';
  document.getElementById('edit-title').value = bookTitle;
  document.getElementById('edit-author').value = bookAuthor;
  document.getElementById('edit-form').dataset.bookId = bookId; // Store book ID in the form
}

// Handle Edit Submission
document.getElementById('edit-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const bookId = event.target.dataset.bookId;
  const title = document.getElementById('edit-title').value.trim();
  const author = document.getElementById('edit-author').value.trim();
  const imageInput = document.getElementById('edit-image');

  const formData = new FormData();
  formData.append('title', title);
  formData.append('author', author);
  if (imageInput.files[0]) {
    formData.append('image', imageInput.files[0]); // Include image if selected
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Unauthorized: Please log in again.');

    const response = await fetch(`http://127.0.0.1:8000/api/books/${bookId}/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to update book.');
    }

    alert('Book updated successfully');
    fetchBooks();
    document.getElementById('edit-book-form').style.display = 'none';
  } catch (error) {
    console.error('Error updating book:', error);
    alert(error.message || 'Failed to update book.');
  }
});

// Cancel Edit
document.getElementById('cancel-edit-btn').addEventListener('click', () => {
  document.getElementById('edit-book-form').style.display = 'none';
});

// Handle Logout
function handleLogout() {
  localStorage.removeItem('token'); // Clear token
  localStorage.removeItem('userId'); // Clear user ID
  alert('You have been logged out.');
  window.location.href = 'login.html'; // Redirect to login
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

// Initialize Page
window.onload = () => {
  const token = localStorage.getItem('token');
  if (token) {
    fetchBooks(); // Fetch books
  } else {
    alert('Unauthorized: Please log in.');
    window.location.href = 'login.html'; // Redirect to login
  }
  updateNavbar();
};
