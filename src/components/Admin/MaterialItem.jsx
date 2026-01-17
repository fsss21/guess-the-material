import React from 'react'
import styles from './MaterialItem.module.css'

function MaterialItem({ material, onEdit, onDelete }) {
  return (
    <li className={styles.listItem}>
      <div>
        <p className={styles.listItemTitle}>{material.name || 'Без названия'}</p>
        <p className={styles.listItemMeta}>Материал: {material.material}</p>
        {material.image && (
          <p className={styles.listItemMeta} style={{ fontSize: '12px', opacity: 0.6 }}>
            {material.image}
          </p>
        )}
      </div>
      <div className={styles.actions}>
        <button 
          type='button' 
          className={styles.editButton} 
          onClick={() => onEdit(material)}
        >
          Редактировать
        </button>
        <button 
          type='button' 
          className={`${styles.editButton} ${styles.deleteButton}`}
          onClick={() => onDelete(material.id)}
        >
          Удалить
        </button>
      </div>
    </li>
  )
}

export default MaterialItem