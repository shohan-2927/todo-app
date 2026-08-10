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

// Send the edited text to the backend, then refresh the list
async function updateNote(id, newText) {
  await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: newText }),
  });
  await loadNotes();
}

// Create the <li> element for a single note, including edit and delete buttons
function renderNote(note) {
  const li = document.createElement('li');

  // The text span — shown normally, replaced by an input when editing
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

// Swaps a note's display text for an editable input box + Save/Cancel buttons
function enterEditMode(li, note) {
  li.innerHTML = ''; // clear the note's current contents

  const input = document.createElement('input');
  input.type = 'text';
  input.value = note.text;

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.onclick = () => updateNote(note.id, input.value.trim());

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.onclick = () => loadNotes(); // just reload, discarding the edit

  li.appendChild(input);
  li.appendChild(saveBtn);
  li.appendChild(cancelBtn);
}