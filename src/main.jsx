import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import NotesApp from './App.jsx'
import Navbar from './Nav.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <Navbar /> */}
    <NotesApp />
  </StrictMode>,
)
