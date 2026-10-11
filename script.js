const addBtn = document.getElementById('newNote');
const mainContainer = document.getElementById('mainContainer');

// 1. Load notes from Python backend on startup
async function fetchNotes() {
    try {
        const response = await fetch('http://127.0.0.1:5000/notes');
        const notes = await response.json();
        
        mainContainer.innerHTML = '';
        notes.forEach(note => {
            appendNoteCard(note.id, note.title, note.message);
        });
    } catch (error) {
        console.p("Error fetching notes:", error);
    }
}

// 2. Helper function to render a note card
function appendNoteCard(id = null, title = "", message = "") {
    const note = document.createElement('div');
    note.classList.add('note-card');

    note.innerHTML = `
        <div class="tools">
            <button class="delete-btn">Delete</button>
        </div>
        <input type="text" class="note-title" placeholder="Title..." value="${title}">
        <textarea placeholder="Write your note here...">${message}</textarea>
    `;

    const titleInput = note.querySelector('.note-title');
    const textarea = note.querySelector('textarea');
    const deleteBtn = note.querySelector('.delete-btn');

    // Optional: Save/sync when user finishes typing or leaves inputs
    // For now, let's make the Add button create a blank note in the DB
    if (!id) {
        saveNewNote(titleInput, textarea, note);
    }

    // Delete Note Logic
    deleteBtn.addEventListener('click', async () => {
        if (id) {
            // Send delete request to backend if it has an ID
            await fetch(`http://127.0.0.1:5000/notes/${id}`, {
                method: 'DELETE'
            });
        }
        note.remove();
    });

    mainContainer.appendChild(note);
}

// 3. Send a new note to the Flask backend
async function saveNewNote(titleInput, textarea, noteElement) {
    // Automatically save when user types something (or you can add a Save button)
    const saveData = async () => {
        const title = titleInput.value.trim();
        const message = textarea.value.trim();
        
        if (title || message) {
            await fetch('http://127.0.0.1:5000/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title || "Untitled", message: message })
            });
        }
    };

    titleInput.addEventListener('blur', saveData);
    textarea.addEventListener('blur', saveData);
}

// 4. Single event listener for the Add button
addBtn.addEventListener('click', () => {
    appendNoteCard();
});

// Initialize on page load
fetchNotes();