// import { useState } from 'react'

// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
      

//     </>
//   )
// }

// export default App
import Navbar from './Nav.jsx';
import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, Save, X } from 'lucide-react';
import './App.css';

// Unique ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Load notes from localStorage on initial render
  useEffect(() => {
    const savedNotes = JSON.parse(localStorage.getItem('notes')) || [];
    setNotes(savedNotes);
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const createNewNote = () => {
    const newNote = {
      id: generateId(),
      title: 'Untitled Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes([newNote, ...notes]);
    setActiveNote(newNote.id);
    setTitle(newNote.title);
    setContent(newNote.content);
    setIsEditing(true);
  };

  const selectNote = (noteId) => {
    const note = notes.find(note => note.id === noteId);
    if (note) {
      setActiveNote(noteId);
      setTitle(note.title);
      setContent(note.content);
      setIsEditing(false);
    }
  };

  const updateNote = () => {
    setNotes(
      notes.map(note => 
        note.id === activeNote 
          ? { 
              ...note, 
              title, 
              content, 
              updatedAt: new Date().toISOString() 
            } 
          : note
      )
    );
    setIsEditing(false);
  };

  const deleteNote = (noteId) => {
    const newNotes = notes.filter(note => note.id !== noteId);
    setNotes(newNotes);
    
    if (activeNote === noteId) {
      setActiveNote(newNotes.length > 0 ? newNotes[0].id : null);
      if (newNotes.length > 0) {
        setTitle(newNotes[0].title);
        setContent(newNotes[0].content);
      } else {
        setTitle('');
        setContent('');
      }
      setIsEditing(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const activeNoteData = notes.find(note => note.id === activeNote);

  return (
    <div className="notes-app">                               
      {/* <header className="app-header">
        My Notes
      </header> */}
       <Navbar />
      <div className="app-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="new-note-container">
            <button onClick={createNewNote} className="new-note-btn">
              <Plus size={18} className="icon" />
              New Note
            </button>
          </div>
          
          <div className="notes-list-container">
            {notes.length === 0 ? (
              <div className="empty-notes-message">
                No notes yet. Create one!
              </div>
            ) : (
              <ul className="notes-list">
                {notes.map(note => (
                  <li 
                    key={note.id} 
                    className={`note-item ${activeNote === note.id ? 'active' : ''}`}
                    onClick={() => selectNote(note.id)}
                  >
                    <div className="note-item-content">
                      <div className="note-details">
                        <h3 className="note-title">{note.title}</h3>
                        <p className="note-preview">{note.content}</p>
                        <p className="note-date">
                          {formatDate(note.updatedAt)}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNote(note.id);
                        }}
                        className="delete-btn"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Main content */}
        <div className="main-content">
          {activeNote ? (
            <>
              <div className="note-header">
                {isEditing ? (
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="title-input"
                    placeholder="Note Title"
                  />
                ) : (
                  <h2 className="note-title-display">{title}</h2>
                )}
                <div className="note-actions">
                  {isEditing ? (
                    <>
                      <button onClick={updateNote} className="save-btn">
                        <Save size={16} className="icon" />
                        Save
                      </button>
                      <button 
                        onClick={() => {
                          setIsEditing(false);
                          setTitle(activeNoteData.title);
                          setContent(activeNoteData.content);
                        }}
                        className="cancel-btn"
                      >
                        <X size={16} className="icon" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={handleEditToggle} className="edit-btn">
                      <Edit size={16} className="icon" />
                      Edit
                    </button>
                  )}
                </div>
              </div>
              <div className="note-content-area">
                {isEditing ? (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="content-textarea"
                    placeholder="Write your note here..."
                  />
                ) : (
                  <div className="content-display">{content}</div>
                )}
              </div>
              <div className="note-footer">
                Last updated: {activeNoteData && formatDate(activeNoteData.updatedAt)}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-state-content">
                <p>Select a note from the sidebar or create a new one</p>
                <button onClick={createNewNote} className="create-note-btn">
                  <Plus size={18} className="icon" />
                  Create Note
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotesApp;