import React, { useState, useEffect } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react";
import { createNote, deleteNote, updateNote } from "./graphql/mutations";
import { listNotes } from "./graphql/queries";

function App() {
  const [notes, setNotes] = useState([]);
  const [note, setNote] = useState("");
  const [updatedNoteId, setUpdatedNoteId] = useState("");
  useEffect(() => {
    (async () => {
      const result = await API.graphql(graphqlOperation(listNotes));
      setNotes(result.data.listNotes.items);
    })();
  }, []);
  const handleNoteChange = event => {
    setNote(event.target.value);
  };
  const hasExistingNode = () => {
    if (updatedNoteId) {
      const isNote = notes.findIndex(note => note.id === updatedNoteId) > -1;
      return isNote;
    }
    return false;
  };
  const saveUpdateNode = async () => {
    const input = { id: updatedNoteId, note };
    const result = await API.graphql(graphqlOperation(updateNote, { input }));
    const updatedNote = result.data.updateNote;
    const index = notes.findIndex(note => note.id === updatedNote.id);
    const updatedNotes = [
      ...notes.slice(0, index),
      updatedNote,
      ...notes.slice(index + 1)
    ];
    setNote("");
    setUpdatedNoteId("");
    setNotes(updatedNotes);
  };
  const handleAddNote = async event => {
    event.preventDefault();
    if (hasExistingNode()) {
      saveUpdateNode();
    } else {
      const result = await API.graphql(
        graphqlOperation(createNote, { input: { note } })
      );
      const newNote = result.data.createNote;
      const updatedNotes = [newNote, ...notes];
      setNote("");
      setNotes(updatedNotes);
    }
  };
  const handleDeleteNote = async (event, id) => {
    const input = { id };
    const res = await API.graphql(graphqlOperation(deleteNote, { input }));
    const deletedNoteId = res.data.deleteNote.id;
    setNotes(notes.filter(item => item.id !== deletedNoteId));
  };
  const handleUpdateNote = async (event, { note, id }) => {
    setNote(note);
    setUpdatedNoteId(id);
  };
  return (
    <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
      <h1 className="code f2-l">Amplify note-taker</h1>
      <form onSubmit={handleAddNote} className="mb-3">
        <input
          type="text"
          className="pa2 f4"
          placeholder="Write your note"
          onChange={handleNoteChange}
          value={note}
        />
        <button className="pa2 f4" type="submit">
          {updatedNoteId ? "Update Note" : "Add Note"}
        </button>
      </form>
      <div>
        {notes.map(item => (
          <div key={item.id} className="flex items-center">
            <li
              onClick={event => handleUpdateNote(event, item)}
              className="pa1 f3"
            >
              {item.note}
            </li>
            <button
              onClick={event => handleDeleteNote(event, item.id)}
              className="bg-transparent bn f4"
            >
              <span>&times;</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default withAuthenticator(App, { includeGreetings: true });
