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
    const note = document.createElement("div");
    note.classList.add("note-card");

    const tools = document.createElement("div");
    tools.className = "tools";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";

    const titleInput = document.createElement("input");
    titleInput.className = "note-title";
    titleInput.placeholder = "Title...";
    titleInput.value = title;

    const textarea = document.createElement("textarea");
    textarea.placeholder = "Write your note here...";
    textarea.value = message;

    tools.appendChild(deleteBtn);
    note.append(tools, titleInput, textarea);
    mainContainer.appendChild(note);

    let noteId = id;
    let savePromise = null;

    async function saveNote() {
        const t = titleInput.value.trim();
        const m = textarea.value.trim();

        if (!t || !m) return;

        // Avoid creating duplicate notes during overlapping blur events.
        if (savePromise) {
            return;
        }

        const isNew = noteId === null;
        const url = isNew
            ? "http://127.0.0.1:5000/notes"
            : `http://127.0.0.1:5000/notes/${noteId}`;

        savePromise = (async () => {
            const response = await fetch(url, {
                method: isNew ? "POST" : "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: t || "Untitled",
                    message: m
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Could not save note");
            }

            if (isNew) {
                noteId = result.id;
            }
        })();

        try {
            await savePromise;
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            savePromise = null;
        }
    }

    titleInput.addEventListener("blur", saveNote);
    textarea.addEventListener("blur", saveNote);

    deleteBtn.addEventListener("click", async () => {
        if (noteId === null) {
            note.remove();
            return;
        }

        try {
            const response = await fetch(
                `http://127.0.0.1:5000/notes/${noteId}`,
                { method: "DELETE" }
            );

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.error || "Delete failed");
            }

            note.remove();
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Note delete nahi hua. Flask terminal check karo.");
        }
    });
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

