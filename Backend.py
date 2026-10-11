import sqlite3


def init_db():
    conn = sqlite3.connect("notes.db")
    cursor = conn.cursor()
    cursor.execute("""
            CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            message TEXT NOT NULL
            )
        """)
    conn.commit()
    conn.close()


def addnotes(title, message):
    conn = sqlite3.connect("notes.db")
    cursor = conn.cursor()
    cursor.execute("INSERT INTO notes (title, message) VALUES (?,?)", (title, message))
    conn.commit()
    conn.close()
    print(f"Note {title} added Successfully")


def listnotes():
    conn = sqlite3.connect("notes.db")
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM notes ORDER BY id DESC")
    display = cursor.fetchall()

    if not display:
        print("No notes available")

    else:
        for i in display:
            print(f"ID: {i[0]}")
            print(f"TITLE: {i[1]}")
            print(f"MESSAGE: {i[2]}")
            print("-" * 20)


def updatenotes():
    keyword = input("Which note do you want to update: ")
    text = input()
    conn = sqlite3.connect("notes.db")
    cursor = conn.cursor()
    querry = "SELECT * FROM notes WHERE title LIKE ? OR message LIKE ? ORDER BY id DESC"
    cursor.execute(querry, (f"{keyword}", f"{keyword}"))
    display = cursor.fetchall()

    if not display:
        print("Nothing Found")
    else:
        id_to_update = display[0][0]
        cursor.execute("UPDATE notes SET message = ? WHERE id = ?",(text,id_to_update))
        print("Row update!")
        conn.commit()
    conn.close()


def deletenotes(todelete):
    conn = sqlite3.connect("notes.db")
    cursor = conn.cursor()
    # querry = "DELETE FROM notes WHERE title LIKE ? OR message LIKE ?"
    querry = "SELECT * FROM notes WHERE title LIKE ? OR message LIKE ? ORDER BY id DESC"
    cursor.execute(querry, (f"{todelete}", f"{todelete}"))
    display = cursor.fetchall()

    if not display:
        print("Nothing Found")
        conn.close()
    else:
        id_to_delete = display[0][0]
        cursor.execute("DELETE FROM notes WHERE id = ?", f"{id_to_delete}")
        print("Row deleted!")
        conn.commit()


def searchnotes():
    keyword = input("Enter a keyword: ")
    conn = sqlite3.connect("notes.db")
    cursor = conn.cursor()
    querry = "SELECT * FROM notes WHERE title LIKE ? OR message LIKE ? ORDER BY id DESC"
    cursor.execute(querry, (f"{keyword}", f"{keyword}"))
    display = cursor.fetchall()
    conn.close()

    if not display:
        print("Nothing found!")
    else:
        for i in display:
            print(f"ID: {i[0]}")
            print(f"TEXT: {i[1]}")
            print(f"MESSAGE: {i[2]}")


def main():
    init_db()
    while True:
        print("\n==NISEMONO NOTES==")
        print("""
        1. Add notes
        2. List notes
        3. Delete note
        4. Search notes
        5. Update notes
        6. EXIT
        """)

        try:
            choise = int(input("Enter your choise: "))
        except ValueError:
            print("Choose Number")
            continue

        match choise:

            case 1:
                title = input("Enter title: ")
                message = input("Enter message: ")
                if title and message:
                    addnotes(title, message)
                else:
                    print("Error! Title or Message can't be empty!")

            case 2:
                listnotes()

            case 3:
                todelete = input("Which note do you want to delete: ")
                deletenotes(todelete)

            case 4:
                searchnotes()

            case 5:
                updatenotes()

            case 6:
                print("Thankyou for using NOTES!")
                break

            case _:
                print("Invalid Input! Please choose between (1-3)")


if __name__ == "__main__":
    main()
