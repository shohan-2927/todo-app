const form = document.getElementById('note-form');
const input = document.getElementById('note-input');
const notesList = document.getElementById('notes-list');

// The address of our backend server
const API_URL = 'http://localhost:3000/notes';

// Load existing notes from the server as soon as the page loads
window.addEventListener('DOMContentLoaded', loadNotes);

async function loadNotes() {
  const response = await fetch(API_URL);     // sends a GET request
  const notes = await response.json();       // parses the JSON response

  notesList.innerHTML = ''; // clear the list first
  notes.forEach(note => addNoteToScreen(note));
}

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const noteText = input.value.trim();
  if (noteText === '') return;

  // Send the new note to the server
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: noteText })
  });

  const newNote = await response.json();
  addNoteToScreen(newNote);

  input.value = '';
});

function addNoteToScreen(note) {
  const li = document.createElement('li');
  li.textContent = note.text;
  li.dataset.id = note.id; // store the note's id on the element, useful for deleting later
  notesList.appendChild(li);
}