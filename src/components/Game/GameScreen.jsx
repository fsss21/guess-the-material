import React from 'react'
import styles from './GameScreen.module.css'
import AnswerButtons from './AnswerButtons'
import ResultOverlay from './ResultOverlay'
import { MAX_QUESTIONS } from '../../constants/gameConstants'

function GameScreen({ 
  currentQuestion, 
  currentItem, 
  selectedAnswer, 
  isCorrect, 
  showResult, 
  onAnswer 
}) {
  return (
    <div className={styles.gameScreen}>
      <div className={styles.counter}>
        Вопрос {currentQuestion} из {MAX_QUESTIONS}
      </div>
      
      <div className={styles.imageContainer}>
        <img 
          src={currentItem?.image} 
          alt={currentItem?.name}
          className={styles.itemImage}
        />
      </div>

      <AnswerButtons
        currentItem={currentItem}
        selectedAnswer={selectedAnswer}
        isCorrect={isCorrect}
        showResult={showResult}
        onAnswer={onAnswer}
      />

      {showResult && (
        <ResultOverlay
          isCorrect={isCorrect}
          currentItem={currentItem}
        />
      )}
    </div>
  )
}

export default GameScreen