import React, { useState, useEffect } from 'react'
import Game from './components/Game'
import AdminPage from './components/AdminPage'
import styles from './App.module.css'

function App() {
  const [showAdmin, setShowAdmin] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Проверяем комбинацию Ctrl+Shift+A
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault()
        setShowAdmin(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  if (showAdmin) {
    return (
      <AdminPage onClose={() => setShowAdmin(false)} />
    )
  }

  return (
    <div className={styles.App}>
      <Game />
    </div>
  )
}

export default App