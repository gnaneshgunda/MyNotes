import Navbar from './Nav.jsx';
import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, Save, X, Folder, File, ChevronDown, ChevronRight } from 'lucide-react';
import './App1.css';

// Unique ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

function NotesApp() {
  const [items, setItems] = useState([]);
  const [activeItem, setActiveItem] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemType, setNewItemType] = useState('note');
  const [currentFolder, setCurrentFolder] = useState(null); // null means root level

  // Load items from localStorage on initial render
  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem('notesItems')) || [];
    setItems(savedItems);
  }, []);

  // Save items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notesItems', JSON.stringify(items));
  }, [items]);

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const openCreateModal = (parentId = null) => {
    setCurrentFolder(parentId);
    setNewItemName('');
    setNewItemType('note');
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
  };

  const createNewItem = () => {
    if (!newItemName.trim()) {
      alert("Please enter a name");
      return;
    }

    const newItem = {
      id: generateId(),
      name: newItemName,
      type: newItemType,
      parentId: currentFolder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (newItemType === 'note') {
      newItem.content = '';
    }

    setItems([newItem, ...items]);
    closeCreateModal();

    if (newItemType === 'note') {
      selectItem(newItem.id);
    } else if (newItemType === 'folder') {
      setExpandedFolders(prev => ({
        ...prev,
        [newItem.id]: true
      }));
    }
  };

  const selectItem = (itemId) => {
    const item = items.find(item => item.id === itemId && item.type === 'note');
    if (item) {
      setActiveItem(itemId);
      setTitle(item.name);
      setContent(item.content || '');
      setIsEditing(false);
    }
  };

  const updateNote = () => {
    setItems(
      items.map(item => 
        item.id === activeItem 
          ? { 
              ...item, 
              name: title, 
              content, 
              updatedAt: new Date().toISOString() 
            } 
          : item
      )
    );
    setIsEditing(false);
  };

  const deleteItem = (itemId) => {
    // Find the item
    const itemToDelete = items.find(item => item.id === itemId);
    
    if (!itemToDelete) return;
    
    // If it's a folder, also delete all items inside it
    let itemsToDelete = [itemId];
    
    if (itemToDelete.type === 'folder') {
      // Recursively find all items inside this folder and its subfolders
      const findChildItems = (parentId) => {
        const children = items.filter(item => item.parentId === parentId);
        children.forEach(child => {
          itemsToDelete.push(child.id);
          if (child.type === 'folder') {
            findChildItems(child.id);
          }
        });
      };
      
      findChildItems(itemId);
    }
    
    // Filter out all items to delete
    const newItems = items.filter(item => !itemsToDelete.includes(item.id));
    setItems(newItems);
    
    if (activeItem === itemId || itemsToDelete.includes(activeItem)) {
      setActiveItem(null);
      setTitle('');
      setContent('');
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

  const renderItems = (parentId = null) => {
    const filteredItems = items.filter(item => item.parentId === parentId);
    
    return (
      <ul className="items-list">
        {filteredItems.map(item => (
          <li key={item.id} className="item-li">
            {item.type === 'folder' ? (
              <div className="folder-item">
                <div 
                  className="folder-header"
                  onClick={() => toggleFolder(item.id)}
                >
                  {expandedFolders[item.id] ? 
                    <ChevronDown size={16} className="icon" /> : 
                    <ChevronRight size={16} className="icon" />
                  }
                  <Folder size={16} className="icon" />
                  <span className="folder-name">{item.name}</span>
                </div>
                <div className="folder-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      openCreateModal(item.id);
                    }}
                    className="add-btn"
                  >
                    <Plus size={14} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item.id);
                    }}
                    className="delete-btn"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                {expandedFolders[item.id] && (
                  <div className="folder-contents">
                    {renderItems(item.id)}
                  </div>
                )}
              </div>
            ) : (
              <div 
                className={`note-item ${activeItem === item.id ? 'active' : ''}`}
                onClick={() => selectItem(item.id)}
              >
                <div className="note-item-content">
                  <div className="note-details">
                    <div className="note-title-row">
                      <File size={16} className="icon" />
                      <h3 className="note-title">{item.name}</h3>
                    </div>
                    <p className="note-preview">{item.content}</p>
                    <p className="note-date">
                      {formatDate(item.updatedAt)}
                    </p>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteItem(item.id);
                    }}
                    className="delete-btn"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  const activeNoteData = items.find(item => item.id === activeItem && item.type === 'note');

  return (
    <div className="notes-app">
      <Navbar />
      <div className="app-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="new-note-container">
            <button onClick={() => openCreateModal(null)} className="new-item-btn">
              <Plus size={18} className="icon" />
              New Item
            </button>
          </div>
          
          <div className="items-list-container">
            {items.length === 0 ? (
              <div className="empty-items-message">
                No items yet. Create one!
              </div>
            ) : (
              renderItems(null)
            )}
          </div>
        </div>
        
        {/* Main content */}
        <div className="main-content">
          {activeItem ? (
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
                          setTitle(activeNoteData.name);
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
                <button onClick={() => openCreateModal(null)} className="create-item-btn">
                  <Plus size={18} className="icon" />
                  Create Note
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Item Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New {newItemType === 'folder' ? 'Folder' : 'Note'}</h3>
            <div className="modal-form">
              <div className="form-group">
                <label>Type</label>
                <div className="type-selector">
                  <button 
                    className={`type-btn ${newItemType === 'note' ? 'active' : ''}`} 
                    onClick={() => setNewItemType('note')}
                  >
                    <File size={16} className="icon" />
                    Note
                  </button>
                  <button 
                    className={`type-btn ${newItemType === 'folder' ? 'active' : ''}`} 
                    onClick={() => setNewItemType('folder')}
                  >
                    <Folder size={16} className="icon" />
                    Folder
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  value={newItemName} 
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={newItemType === 'folder' ? "Folder Name" : "Note Name"} 
                  className="name-input"
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button onClick={closeCreateModal} className="cancel-btn">
                  <X size={16} className="icon" />
                  Cancel
                </button>
                <button onClick={createNewItem} className="create-btn">
                  <Plus size={16} className="icon" />
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotesApp;