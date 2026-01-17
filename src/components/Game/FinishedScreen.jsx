import React from 'react'
import styles from './FinishedScreen.module.css'
import { MAX_QUESTIONS } from '../../constants/gameConstants'

function FinishedScreen({ score, onRestart }) {
  const getScoreMessage = () => {
    const percentage = (score / MAX_QUESTIONS) * 100
    if (percentage >= 80) return 'Отлично! Вы разбираетесь в исторических материалах'
    if (percentage >= 60) return 'Хорошо! У вас есть знания об археологических находках'
    if (percentage >= 40) return 'Неплохо! Продолжайте изучать исторические материалы'
    return 'Попробуйте еще раз, чтобы узнать больше о материалах!'
  }

  return (
    <div className={styles.finishedScreen}>
      <h2 className={styles.finishedTitle}>🎉 Игра завершена!</h2>
      <div className={styles.finishedScore}>
        <p className={styles.scoreText}>
          Вы угадали <span className={styles.scoreNumber}>{score}</span> из {MAX_QUESTIONS} материалов!
        </p>
        <p className={styles.scoreMessage}>{getScoreMessage()}</p>
      </div>
      <div className={styles.finishedButtons}>
        <button className={styles.finishedButton} onClick={onRestart}>
          Играть снова
        </button>
        <button className={`${styles.finishedButton} ${styles.finishedButtonSecondary}`}>
          Перейти к каталогу находок
        </button>
      </div>
    </div>
  )
}

export default FinishedScreen