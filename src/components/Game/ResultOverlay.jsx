import React from 'react'
import styles from './ResultOverlay.module.css'

function ResultOverlay({ isCorrect, currentItem }) {
  if (!currentItem) {
    return null
  }

  return (
    <div className={styles.resultOverlay}>
      <div className={styles.resultContent}>
        <div className={`${styles.resultIcon} ${isCorrect ? styles.resultIconCorrect : styles.resultIconIncorrect}`}>
          {isCorrect ? '✅' : '❌'}
        </div>
        {!isCorrect && currentItem.material && (
          <p className={styles.correctAnswer}>
            Правильный ответ: {currentItem.material}
          </p>
        )}
        {currentItem.description && (
          <p className={styles.resultDescription}>
            {currentItem.description}
          </p>
        )}
      </div>
    </div>
  )
}

export default ResultOverlay