import React from 'react'
import styles from './StartScreen.module.css'

function StartScreen({ onStart }) {
  return (
    <div className={styles.startScreen}>
      <h1 className={styles.startTitle}>Угадай материал</h1>
      <p className={styles.startSubtitle}>Из чего сделан этот предмет?</p>
      <button className={styles.startButton} onClick={onStart}>
        Начать игру
      </button>
    </div>
  )
}

export default StartScreen