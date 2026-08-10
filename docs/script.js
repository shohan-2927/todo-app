const API_URL = 'https://todo-app-backend-65s5.onrender.com';

// --- Elements ---
const authScreen = document.getElementById('auth-screen');
const notesScreen = document.getElementById('notes-screen');
const authForm = document.getElementById('auth-form');
const authEmail = document.getElementById('auth-email');
const authPassword = document.getElementById('auth-password');
const authError = document.getElementById('auth-error');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authToggleText = document.getElementById('auth-toggle-text');
const authToggleLink = document.getElementById('auth-toggle-link');
const userEmailSpan = document.getElementById('user-email');
const logoutLink = document.getElementById('logout-link');

const form = document.getElementById('note-form');
const input = document.getElementById('note-input');
const notesList = document.getElementById('notes-list');

// Whether we're currently showing the "Sign up" or "Log in" form
let isSignupMode = false;

// --- On page load: check if we already have a saved token ---
document.addEventListener('DOMContentLoaded', () => {
  const savedToken = localStorage.getItem('token');
  const savedEmail = localStorage.getItem('email');
  if (savedToken) {
    showNotesScreen(savedEmail);
    loadNotes();
  }
});

// --- Toggle between Login and Sign up ---
authToggleLink.addEventListener('click', (e) => {
  e.preventDefault();
  isSignupMode = !isSignupMode;
  authSubmitBtn.textContent = isSignupMode ? 'Sign Up' : 'Log In';
  authToggleText.textContent = isSignupMode ? 'Already have an account?' : 'No account?';
  authToggleLink.textContent = isSignupMode ? 'Log in' : 'Sign up';
  authError.textContent = '';
});

// --- Handle login/signup form submit ---
authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.textContent = '';

  const email = authEmail.value.trim();
  const password = authPassword.value;
  const endpoint = isSignupMode ? '/signup' : '/login';

  try {
    const response = await fetch(API_URL + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      authError.textContent = data.error || 'Something went wrong';
      return;
    }

    // Save the token so the user stays logged in across page refreshes
    localStorage.setItem('token', data.token);
    localStorage.setItem('email', email);

    showNotesScreen(email);
    loadNotes();
  } catch (err) {
    authError.textContent = 'Could not reach the server. Try again.';
  }
});

// --- Logout ---
logoutLink.addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('token');
  localStorage.removeItem('email');
  notesList.innerHTML = '';
  authForm.reset();
  showAuthScreen();
});

function showNotesScreen(email) {
  authScreen.classList.add('hidden');
  notesScreen.classList.remove('hidden');
  userEmailSpan.textContent = email;
}

function showAuthScreen() {
  notesScreen.classList.add('hidden');
  authScreen.classList.remove('hidden');
}

// --- Helper: build the Authorization header using the saved token ---
function authHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
}

// --- Notes logic (same as before, but every request now includes the token) ---

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  const noteText = input.value.trim();
  if (noteText === '') return;
  await addNote(noteText);
  input.value = '';
});

async function loadNotes() {
  const response = await fetch(`${API_URL}/notes`, { headers: authHeaders() });

  if (response.status === 401) {
    // Token expired or invalid — send the user back to login
    localStorage.removeItem('token');
    showAuthScreen();
    return;
  }

  const notes = await response.json();
  notesList.innerHTML = '';
  notes.forEach(note => renderNote(note));
}

async function addNote(text) {
  await fetch(`${API_URL}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ text }),
  });
  await loadNotes();
}

async function updateNote(id, newText) {
  await fetch(`${API_URL}/notes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ text: newText }),
  });
  await loadNotes();
}

async function deleteNote(id) {
  await fetch(`${API_URL}/notes/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  await loadNotes();
}

function renderNote(note) {
  const li = document.createElement('li');

  const textSpan = document.createElement('span');
  textSpan.textContent = note.text;
  textSpan.className = 'note-text';

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.onclick = () => enterEditMode(li, note);

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'x';
  deleteBtn.onclick = () => deleteNote(note.id);

  li.appendChild(textSpan);
  li.appendChild(editBtn);
  li.appendChild(deleteBtn);
  notesList.appendChild(li);
}

function enterEditMode(li, note) {
  li.innerHTML = '';

  const editInput = document.createElement('input');
  editInput.type = 'text';
  editInput.value = note.text;

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.onclick = () => updateNote(note.id, editInput.value.trim());

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.onclick = () => loadNotes();

  li.appendChild(editInput);
  li.appendChild(saveBtn);
  li.appendChild(cancelBtn);
}