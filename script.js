const addBtn = document.getElementById('newNote');
const mainContainer = document.getElementById('mainContainer');
const searchInput = document.getElementById('search');

// Load notes on startup from Python backend
async function fetchNotes() {
    try {
        const response = await fetch('http://127.0.0.1:5000/notes');
        const notes = await response.json();
        
        mainContainer.innerHTML = '';
        notes.forEach(note => {
            appendNoteCard(note.id, note.title, note.message);
        });
    } catch (error) {
        console.error("Error fetching notes:", error);
    }
}

// Helper function to render a note card
function appendNoteCard(id = null, title = "", message = "") {
    const note = document.createElement('div');
    note.classList.add('note-card');

    note.innerHTML = `
        <div class="tools">
            <button class="delete-btn"><i class="fas fa-trash"></i> Delete</button>
        </div>
        <input type="text" class="note-title" placeholder="Title..." value="${title}">
        <textarea placeholder="Write your note here...">${message}</textarea>
    `;

    const titleInput = note.querySelector('.note-title');
    const textarea = note.querySelector('textarea');
    const deleteBtn = note.querySelector('.delete-btn');

    // Save note to database when user finishes typing and leaves the field (blur)
    const saveNote = async () => {
        const t = titleInput.value.trim();
        const m = textarea.value.trim();
        if (t || m) {
            await fetch('http://127.0.0.1:5000/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: t || "Untitled", message: m })
            });
        }
    };

    titleInput.addEventListener('blur', saveNote);
    textarea.addEventListener('blur', saveNote);

    // Delete Note Logic
    deleteBtn.addEventListener('click', async () => {
        if (id) {
            await fetch(`http://127.0.0.1:5000/notes/${id}`, {
                method: 'DELETE'
            });
        }
        note.remove();
    });

    mainContainer.appendChild(note);
}

// Search functionality: Triggers when user types and presses Enter
searchInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
        const keyword = e.target.value.trim();
        try {
            const response = await fetch(`http://127.0.0.1:5000/notes/search?q=${encodeURIComponent(keyword)}`);
            const notes = await response.json();
            
            mainContainer.innerHTML = '';
            notes.forEach(note => {
                appendNoteCard(note.id, note.title, note.message);
            });
        } catch (error) {
            console.error("Error searching notes:", error);
        }
    }
});

// Add Note Button Click Logic
addBtn.addEventListener('click', () => {
    appendNoteCard();
});

// Initialize on page load
fetchNotes();