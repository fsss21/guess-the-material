import React from 'react'
import styles from './MaterialForm.module.css'
import { MATERIAL_OPTIONS } from '../../constants/gameConstants'

function MaterialForm({ 
  formValues, 
  editingId, 
  formError, 
  successMessage, 
  saving, 
  onInputChange, 
  onSubmit, 
  onReset 
}) {
  return (
    <section className={styles.formSection}>
      <h2>{editingId ? 'Редактировать материал' : 'Добавить новый материал'}</h2>
      <form className={styles.form} onSubmit={onSubmit}>
        {editingId && (
          <label className={styles.label}>
            ID
            <input 
              type='number' 
              name='id' 
              value={formValues.id} 
              onChange={onInputChange} 
              placeholder='1' 
              min='1' 
            />
          </label>
        )}

        <label className={styles.label}>
          Название
          <input 
            type='text' 
            name='name' 
            value={formValues.name} 
            onChange={onInputChange} 
            placeholder='Например, Изразцы' 
          />
        </label>

        <label className={styles.label}>
          Материал
          <select 
            name='material' 
            value={formValues.material} 
            onChange={onInputChange}
          >
            <option value=''>Выберите материал</option>
            {MATERIAL_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label className={styles.label}>
          Ссылка на изображение
          <input 
            type='text' 
            name='image' 
            value={formValues.image} 
            onChange={onInputChange} 
            placeholder='https://via.placeholder.com/600x400' 
          />
        </label>

        <label className={styles.label}>
          Описание
          <textarea 
            name='description' 
            value={formValues.description} 
            onChange={onInputChange} 
            rows={6} 
            placeholder='Описание материала...' 
          />
        </label>

        <label className={styles.label}>
          Категория
          <input 
            type='text' 
            name='category' 
            value={formValues.category} 
            onChange={onInputChange} 
            placeholder='Например, печное отопление XVIII-XIX вв.' 
          />
        </label>

        {formValues.image?.trim() && (
          <div className={styles.preview}>
            <h3 className={styles.previewTitle}>Превью изображения</h3>
            <div className={styles.previewContainer}>
              <img 
                src={formValues.image.trim()} 
                alt={formValues.name || 'Preview'} 
                style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {formError && <p className={styles.error}>{formError}</p>}
        {successMessage && <p className={styles.success}>{successMessage}</p>}

        <div className={styles.formActions}>
          {editingId && (
            <button type='button' className={styles.secondaryButton} onClick={onReset}>
              Отменить
            </button>
          )}
          <button type='submit' className={styles.primaryButton} disabled={saving}>
            {saving ? 'Сохраняем...' : editingId ? 'Сохранить' : 'Добавить'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default MaterialForm