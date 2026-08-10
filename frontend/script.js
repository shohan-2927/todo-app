const form = document.getElementById('note-form');
const input = document.getElementById('note-input');
const notesList = document.getElementById('notes-list');

// The address where our backend server is running (now live on Render)
const API_URL = 'https://todo-app-backend-65s5.onrender.com/notes';

// Run this once when the page first loads
document.addEventListener('DOMContentLoaded', loadNotes);

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const noteText = input.value.trim();
  if (noteText === '') return;

  await addNote(noteText);
  input.value = '';
});

// Fetch all notes from the backend and display them
async function loadNotes() {
  const response = await fetch(API_URL);
  const notes = await response.json();

  notesList.innerHTML = ''; // clear the list first
  notes.forEach(note => renderNote(note));
}

// Send a new note to the backend, then refresh the list
async function addNote(text) {
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });

  await loadNotes(); // reload the list so the new note appears
}

// Tell the backend to delete a note, then refresh the list
async function deleteNote(id) {
  await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  await loadNotes();
}

// Create the <li> element for a single note, including a delete button
function renderNote(note) {
  const li = document.createElement('li');
  li.textContent = note.text + ' ';

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'x';
  deleteBtn.onclick = () => deleteNote(note.id);

  li.appendChild(deleteBtn);
  notesList.appendChild(li);
}