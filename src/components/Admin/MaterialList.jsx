import React from 'react'
import styles from './MaterialList.module.css'
import MaterialItem from './MaterialItem'

function MaterialList({ materials, loading, listError, onEdit, onDelete }) {
  return (
    <section className={styles.listSection}>
      <div className={styles.sectionHeader}>
        <h2>Все материалы</h2>
        <span>{materials.length}</span>
      </div>

      {loading && <p className={styles.status}>Загружаем...</p>}
      {!loading && listError && <p className={styles.error}>{listError}</p>}

      {!loading && !listError && (
        <ul className={styles.list}>
          {materials.map((material) => (
            <MaterialItem
              key={material.id}
              material={material}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}

          {materials.length === 0 && <p className={styles.status}>Список пуст</p>}
        </ul>
      )}
    </section>
  )
}

export default MaterialList