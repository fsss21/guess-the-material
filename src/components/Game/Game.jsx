import React, { useState, useEffect } from 'react'
import LoadingScreen from './LoadingScreen'
import StartScreen from './StartScreen'
import GameScreen from './GameScreen'
import FinishedScreen from './FinishedScreen'
import CatalogScreen from './CatalogScreen'
import { MAX_QUESTIONS } from '../../constants/gameConstants'

function Game() {
  const [gameState, setGameState] = useState('start') // start, playing, result, finished, catalog
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentItem, setCurrentItem] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [usedItems, setUsedItems] = useState([])
  const [shuffledItems, setShuffledItems] = useState([])

  useEffect(() => {
    // Загружаем данные из JSON файла
    fetch('/materials.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Данные не найдены или пусты')
        }
        setItems(data)
        // Перемешиваем предметы для случайного порядка
        const shuffled = [...data].sort(() => Math.random() - 0.5)
        setShuffledItems(shuffled)
        setLoading(false)
      })
      .catch(error => {
        console.error('Ошибка загрузки данных:', error)
        setError('Не удалось загрузить данные. Пожалуйста, обновите страницу.')
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
    if (selectedAnswer || !currentItem) return // Уже отвечали или нет предмета

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
        if (nextQuestion > MAX_QUESTIONS) {
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

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        color: 'white',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>⚠️ Ошибка загрузки</h2>
        <p style={{ fontSize: '18px', marginBottom: '30px' }}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            fontSize: '18px',
            fontWeight: '600',
            border: '2px solid white',
            borderRadius: '12px',
            cursor: 'pointer',
            background: 'white',
            color: '#667eea',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
          }}
        >
          Обновить страницу
        </button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        color: 'white',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>📦 Нет данных</h2>
        <p style={{ fontSize: '18px', marginBottom: '30px' }}>
          Материалы не найдены. Пожалуйста, проверьте файл materials.json
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '12px 24px',
            fontSize: '18px',
            fontWeight: '600',
            border: '2px solid white',
            borderRadius: '12px',
            cursor: 'pointer',
            background: 'white',
            color: '#667eea',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)'
          }}
        >
          Обновить страницу
        </button>
      </div>
    )
  }

  if (gameState === 'start') {
    return <StartScreen onStart={handleStart} />
  }

  if (gameState === 'playing' || gameState === 'result') {
    if (!currentItem) {
      // Если нет текущего предмета, возвращаемся к началу
      return <StartScreen onStart={handleStart} />
    }
    return (
      <GameScreen
        currentQuestion={currentQuestion}
        currentItem={currentItem}
        selectedAnswer={selectedAnswer}
        isCorrect={isCorrect}
        showResult={gameState === 'result'}
        onAnswer={handleAnswer}
      />
    )
  }

  if (gameState === 'finished') {
    return (
      <FinishedScreen 
        score={score} 
        onRestart={handleRestart}
        onShowCatalog={() => setGameState('catalog')}
      />
    )
  }

  if (gameState === 'catalog') {
    return (
      <CatalogScreen 
        onBack={() => setGameState('start')}
        onBackToResults={() => setGameState('finished')}
      />
    )
  }

  return null
}

export default Game