import React, { useState, useEffect } from 'react'
import styles from './CatalogScreen.module.css'

function CatalogScreen({ onBack, onBackToResults }) {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetch('/materials.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
      })
      .then(data => {
        if (!Array.isArray(data)) {
          throw new Error('Неверный формат данных')
        }
        setMaterials(data)
        setLoading(false)
        setError(null)
      })
      .catch(error => {
        console.error('Ошибка загрузки каталога:', error)
        setError('Не удалось загрузить каталог находок')
        setLoading(false)
      })
  }, [])

  // Получаем уникальные категории
  const categories = ['all', ...new Set(materials.map(m => m.category).filter(Boolean))]

  // Фильтруем материалы по категории
  const filteredMaterials = selectedCategory === 'all'
    ? materials
    : materials.filter(m => m.category === selectedCategory)

  if (loading) {
    return (
      <div className={styles.catalogScreen}>
        <div className={styles.loading}>Загрузка каталога...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.catalogScreen}>
        <div className={styles.header}>
          <h1 className={styles.title}>📚 Каталог находок</h1>
          <button className={styles.backButton} onClick={onBack}>
            ← Начать игру
          </button>
        </div>
        <div className={styles.errorState}>
          <p>{error}</p>
          <button className={styles.retryButton} onClick={() => window.location.reload()}>
            Обновить страницу
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.catalogScreen}>
      <div className={styles.header}>
        <h1 className={styles.title}>📚 Каталог находок</h1>
        <div className={styles.headerButtons}>
          {onBackToResults && (
            <button className={styles.backButton} onClick={onBackToResults}>
              ← К результатам
            </button>
          )}
          <button className={styles.backButton} onClick={onBack}>
            ← Начать игру
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        {categories.map(category => (
          <button
            key={category}
            className={`${styles.filterButton} ${selectedCategory === category ? styles.active : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category === 'all' ? 'Все находки' : category}
          </button>
        ))}
      </div>

      <div className={styles.materialsGrid}>
        {filteredMaterials.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Находки не найдены</p>
          </div>
        ) : (
          filteredMaterials.map(material => (
            <div key={material.id} className={styles.materialCard}>
              <div className={styles.materialImageContainer}>
                {material.image ? (
                  <img
                    src={material.image}
                    alt={material.name || 'Изображение находки'}
                    className={styles.materialImage}
                    onError={(e) => {
                      e.target.style.display = 'none'
                      const placeholder = document.createElement('div')
                      placeholder.className = styles.imagePlaceholder
                      placeholder.textContent = 'Изображение не загружено'
                      e.target.parentElement.appendChild(placeholder)
                    }}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>Нет изображения</div>
                )}
              </div>
              <div className={styles.materialInfo}>
                <h3 className={styles.materialName}>{material.name}</h3>
                <p className={styles.materialType}>
                  <strong>Материал:</strong> {material.material}
                </p>
                {material.category && (
                  <p className={styles.materialCategory}>
                    <strong>Категория:</strong> {material.category}
                  </p>
                )}
                {material.description && (
                  <p className={styles.materialDescription}>{material.description}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default CatalogScreen
