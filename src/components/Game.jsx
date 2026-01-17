import React, { useState, useEffect } from 'react'
import styles from './Game.module.css'

const ANSWER_OPTIONS = [
  'Керамика/глина',
  'Металл (железо/медь)',
  'Дерево',
  'Камень/кирпич'
]

function Game() {
  const [gameState, setGameState] = useState('start') // start, playing, result, finished
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentItem, setCurrentItem] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [usedItems, setUsedItems] = useState([])
  const [shuffledItems, setShuffledItems] = useState([])
  const maxQuestions = 10

  useEffect(() => {
    // Загружаем данные из JSON файла
    fetch('/materials.json')
      .then(response => response.json())
      .then(data => {
        setItems(data)
        // Перемешиваем предметы для случайного порядка
        const shuffled = [...data].sort(() => Math.random() - 0.5)
        setShuffledItems(shuffled)
        setLoading(false)
      })
      .catch(error => {
        console.error('Ошибка загрузки данных:', error)
        setLoading(false)
      })
  }, [])

  const startNewQuestion = (questionNum, usedIds, itemsList) => {
    if (!itemsList || itemsList.length === 0) return
    
    // Берем предмет, который еще не использовался
    const availableItems = itemsList.filter(item => !usedIds.includes(item.id))
    let newItem
    let newUsedItems
    let newShuffledItems = itemsList

    if (availableItems.length === 0) {
      // Если все предметы использованы, перемешиваем заново
      const reshuffled = [...itemsList].sort(() => Math.random() - 0.5)
      newShuffledItems = reshuffled
      newItem = reshuffled[0]
      newUsedItems = [reshuffled[0].id]
    } else {
      newItem = availableItems[0]
      newUsedItems = [...usedIds, availableItems[0].id]
    }
    
    setShuffledItems(newShuffledItems)
    setUsedItems(newUsedItems)
    setCurrentItem(newItem)
    setSelectedAnswer(null)
    setIsCorrect(false)
  }

  const handleStart = () => {
    setGameState('playing')
    setCurrentQuestion(1)
    setScore(0)
    setUsedItems([])
    // Используем setTimeout чтобы состояние успело обновиться
    setTimeout(() => {
      startNewQuestion(1, [], shuffledItems.length > 0 ? shuffledItems : items)
    }, 0)
  }

  const handleAnswer = (answer) => {
    if (selectedAnswer) return // Уже отвечали

    const correct = answer === currentItem.material
    setSelectedAnswer(answer)
    setIsCorrect(correct)
    setGameState('result')

    if (correct) {
      setScore(prevScore => prevScore + 1)
    }

    // Через 5 секунд переходим к следующему вопросу или финалу
    setTimeout(() => {
      setCurrentQuestion(prevQuestion => {
        const nextQuestion = prevQuestion + 1
        if (nextQuestion > maxQuestions) {
          setGameState('finished')
          return prevQuestion
        } else {
          setGameState('playing')
          // Получаем актуальные значения через callback
          setUsedItems(currentUsedItems => {
            setShuffledItems(currentShuffled => {
              const itemsToUse = currentShuffled.length > 0 ? currentShuffled : items
              startNewQuestion(nextQuestion, currentUsedItems, itemsToUse)
              return currentShuffled
            })
            return currentUsedItems
          })
          return nextQuestion
        }
      })
    }, 5000)
  }

  const handleRestart = () => {
    setGameState('start')
    setCurrentQuestion(0)
    setScore(0)
    setUsedItems([])
    setSelectedAnswer(null)
  }

  const getScoreMessage = () => {
    const percentage = (score / maxQuestions) * 100
    if (percentage >= 80) return 'Отлично! Вы разбираетесь в исторических материалах'
    if (percentage >= 60) return 'Хорошо! У вас есть знания об археологических находках'
    if (percentage >= 40) return 'Неплохо! Продолжайте изучать исторические материалы'
    return 'Попробуйте еще раз, чтобы узнать больше о материалах!'
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Загрузка данных...</p>
      </div>
    )
  }

  if (gameState === 'start') {
    return (
      <div className={styles.startScreen}>
        <h1 className={styles.startTitle}>Угадай материал</h1>
        <p className={styles.startSubtitle}>Из чего сделан этот предмет?</p>
        <button className={styles.startButton} onClick={handleStart}>
          Начать игру
        </button>
      </div>
    )
  }

  if (gameState === 'playing' || gameState === 'result') {
    const showResult = gameState === 'result'
    
    return (
      <div className={styles.gameScreen}>
        <div className={styles.counter}>
          Вопрос {currentQuestion} из {maxQuestions}
        </div>
        
        <div className={styles.imageContainer}>
          <img 
            src={currentItem?.image} 
            alt={currentItem?.name}
            className={styles.itemImage}
          />
        </div>

        <div className={styles.answersContainer}>
          {ANSWER_OPTIONS.map((option, index) => {
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
                key={index}
                className={buttonClass}
                onClick={() => handleAnswer(option)}
                disabled={showResult}
              >
                {option}
              </button>
            )
          })}
        </div>

        {showResult && (
          <div className={styles.resultOverlay}>
            <div className={styles.resultContent}>
              <div className={`${styles.resultIcon} ${isCorrect ? styles.resultIconCorrect : styles.resultIconIncorrect}`}>
                {isCorrect ? '✅' : '❌'}
              </div>
              {!isCorrect && (
                <p className={styles.correctAnswer}>
                  Правильный ответ: {currentItem?.material}
                </p>
              )}
              <p className={styles.resultDescription}>
                {currentItem?.description}
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (gameState === 'finished') {
    return (
      <div className={styles.finishedScreen}>
        <h2 className={styles.finishedTitle}>🎉 Игра завершена!</h2>
        <div className={styles.finishedScore}>
          <p className={styles.scoreText}>
            Вы угадали <span className={styles.scoreNumber}>{score}</span> из {maxQuestions} материалов!
          </p>
          <p className={styles.scoreMessage}>{getScoreMessage()}</p>
        </div>
        <div className={styles.finishedButtons}>
          <button className={styles.finishedButton} onClick={handleRestart}>
            Играть снова
          </button>
          <button className={`${styles.finishedButton} ${styles.finishedButtonSecondary}`}>
            Перейти к каталогу находок
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default Game