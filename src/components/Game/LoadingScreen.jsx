import React from 'react'
import styles from './LoadingScreen.module.css'

function LoadingScreen() {
  return (
    <div className={styles.loading}>
      <p>Загрузка данных...</p>
    </div>
  )
}

export default LoadingScreen