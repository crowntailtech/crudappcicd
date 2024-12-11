// Fetch Books from API
async function fetchBooks() {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Unauthorized: Please log in again.');

    const response = await fetch('http://3.93.180.211:8000/api/books/', {
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
      handleLogout();
    }
  }
}

// Display Books
function displayBooks(books) {
  const bookList = document.getElementById('book-list');
  bookList.innerHTML = '';

  books.forEach((book) => {
    const bookBox = document.createElement('div');
    bookBox.className = 'book-box';

    const imageUrl = book.image ? `http://3.93.180.211:8000${book.image}` : 'placeholder.png';

    bookBox.innerHTML = `
      <img src="${imageUrl}" alt="${book.title}" />
      <h3>${book.title}</h3>
      <p>Author: ${book.author}</p>
      <p>Assigned to: ${book.assigned_to || 'None'}</p>
      <button class="edit-btn" data-id="${book.id}" data-title="${book.title}" data-author="${book.author}">Edit</button>
      <button class="delete-btn" data-id="${book.id}">Delete</button>
      <button class="assign-btn" data-id="${book.id}" data-title="${book.title}">Assign</button>
    `;
    bookList.appendChild(bookBox);
  });

  // Attach event listeners after rendering
  document.querySelectorAll('.delete-btn').forEach((btn) =>
    btn.addEventListener('click', (e) => deleteBook(e.target.dataset.id))
  );

  document.querySelectorAll('.edit-btn').forEach((btn) =>
    btn.addEventListener('click', (e) =>
      showEditForm(e.target.dataset.id, e.target.dataset.title, e.target.dataset.author)
    )
  );

  document.querySelectorAll('.assign-btn').forEach((btn) =>
    btn.addEventListener('click', (e) =>
      showAssignForm(e.target.dataset.id, e.target.dataset.title)
    )
  );
}

// Add Book
// Add Book
document.getElementById('book-form').addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent the default form submission behavior

  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const imageInput = document.getElementById('image');

  if (!title || !author) {
    alert('Please fill in all fields.');
    return;
  }

  const formData = new FormData();
  formData.append('title', title);
  formData.append('author', author);
  if (imageInput.files[0]) {
    formData.append('image', imageInput.files[0]);
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Unauthorized: Please log in again.');

    const response = await fetch('http://3.93.180.211:8000/api/books/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to add book.');
    }

    alert('Book added successfully');
    document.getElementById('book-form').reset();
    fetchBooks();
  } catch (error) {
    console.error('Error adding book:', error);
    alert(error.message || 'Failed to add book.');
  }
});


// Delete Book
async function deleteBook(bookId) {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Unauthorized: Please log in again.');

    const response = await fetch(`http://3.93.180.211:8000/api/books/${bookId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete book.');
    }

    alert('Book deleted successfully');
    fetchBooks();
  } catch (error) {
    console.error('Error deleting book:', error);
    alert(error.message || 'Failed to delete book.');
  }
}

// Assign Book
document.getElementById('assign-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const bookId = document.getElementById('assign-form').dataset.bookId;
  const assignTo = document.getElementById('assign-to').value.trim();

  if (!assignTo) {
    alert('Please provide a name to assign the book.');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Unauthorized: Please log in again.');

    const response = await fetch(`http://3.93.180.211:8000/api/books/${bookId}/assign/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ assigned_to: assignTo }),
    });

    if (!response.ok) {
      throw new Error('Failed to assign book.');
    }

    alert(`Book assigned to ${assignTo}`);
    fetchBooks();
    document.getElementById('assign-book-form').style.display = 'none';
  } catch (error) {
    console.error('Error assigning book:', error);
    alert(error.message || 'Failed to assign book.');
  }
});

// Show Assign Form
function showAssignForm(bookId, bookTitle) {
  document.getElementById('assign-book-form').style.display = 'block';
  document.getElementById('assign-book-title').textContent = `Assign Book: ${bookTitle}`;
  document.getElementById('assign-form').dataset.bookId = bookId;
}

// Cancel Assign Form
document.getElementById('cancel-assign-btn').addEventListener('click', () => {
  document.getElementById('assign-book-form').style.display = 'none';
});

// Show Edit Form
function showEditForm(bookId, bookTitle, bookAuthor) {
  document.getElementById('edit-book-form').style.display = 'block';
  document.getElementById('edit-title').value = bookTitle;
  document.getElementById('edit-author').value = bookAuthor;
  document.getElementById('edit-form').dataset.bookId = bookId;
}

// Edit Book
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
    formData.append('image', imageInput.files[0]);
  }

  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Unauthorized: Please log in again.');

    const response = await fetch(`http://3.93.180.211:8000/api/books/${bookId}/`, {
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

// Cancel Edit Form
document.getElementById('cancel-edit-btn').addEventListener('click', () => {
  document.getElementById('edit-book-form').style.display = 'none';
});

// Initialize
window.onload = () => {
  const token = localStorage.getItem('token');
  if (token) {
    fetchBooks();
  } else {
    alert('Unauthorized: Please log in.');
    window.location.href = 'login.html';
  }
};
