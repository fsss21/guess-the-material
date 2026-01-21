import React from 'react'
import styles from './AnswerButtons.module.css'
import { ANSWER_OPTIONS } from '../../constants/gameConstants'

function AnswerButtons({ currentItem, selectedAnswer, isCorrect, showResult, onAnswer }) {
  return (
    <div className={styles.answersContainer}>
      {ANSWER_OPTIONS.map((option) => {
        const isSelected = selectedAnswer === option
        const isCorrectAnswer = option === currentItem?.material
        let buttonClass = styles.answerButton

        if (showResult) {
          if (isCorrectAnswer) {
            buttonClass = `${styles.answerButton} ${styles.answerCorrect}`
          } else if (isSelected && !isCorrect) {
            buttonClass = `${styles.answerButton} ${styles.answerIncorrect}`
          }
        }

        return (
          <button
            key={option}
            className={buttonClass}
            onClick={() => onAnswer(option)}
            disabled={showResult}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

export default AnswerButtons