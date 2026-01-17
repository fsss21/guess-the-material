import { useCallback, useEffect, useState } from 'react';
import styles from './AdminPage.module.css';

const emptyForm = {
  name: '',
  material: '',
  image: '',
  description: '',
  category: '',
};

const AdminPage = ({ onClose }) => {
  const [materials, setMaterials] = useState([]);
  const [formValues, setFormValues] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const MATERIAL_OPTIONS = [
    'Керамика/глина',
    'Металл (железо/медь)',
    'Дерево',
    'Камень/кирпич',
    'Стекло'
  ];

  const loadMaterials = useCallback(async () => {
    setLoading(true);
    setListError('');
    try {
      const response = await fetch('/api/materials');
      if (!response.ok) {
        throw new Error('Не удалось загрузить материалы');
      }
      const data = await response.json();
      setMaterials(Array.isArray(data) ? data : []);
    } catch (err) {
      setListError(err.message || 'Не удалось получить список материалов');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const startEdit = (material) => {
    setEditingId(material.id);
    setFormValues({
      id: material.id || '',
      name: material.name || '',
      material: material.material || '',
      image: material.image || '',
      description: material.description || '',
      category: material.category || '',
    });
    setFormError('');
    setSuccessMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormValues(emptyForm);
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');
    setSaving(true);

    const payload = {
      name: formValues.name.trim(),
      material: formValues.material.trim(),
      image: formValues.image.trim(),
      description: formValues.description.trim(),
      category: formValues.category.trim(),
    };

    if (!payload.name || !payload.material || !payload.description) {
      setFormError('Название, материал и описание обязательны');
      setSaving(false);
      return;
    }

    try {
      let response;
      if (editingId) {
        // Обновление существующего материала
        const updatePayload = { ...payload };
        if (formValues.id && parseInt(formValues.id) !== editingId) {
          updatePayload.id = parseInt(formValues.id);
        }
        response = await fetch(`/api/materials/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Не удалось обновить материал');
        }
        
        const updatedMaterial = await response.json();
        setMaterials(materials.map(m => m.id === editingId ? updatedMaterial : m));
        setSuccessMessage('Материал обновлён');
      } else {
        // Создание нового материала
        response = await fetch('/api/materials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Не удалось создать материал');
        }
        
        const newMaterial = await response.json();
        setMaterials([...materials, newMaterial]);
        setSuccessMessage('Материал добавлен');
      }
      
      resetForm();
    } catch (err) {
      setFormError(err.message || 'Не удалось сохранить изменения');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот материал?')) {
      return;
    }

    try {
      const response = await fetch(`/api/materials/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Не удалось удалить материал');
      }

      setMaterials(materials.filter(m => m.id !== id));
      setSuccessMessage('Материал удалён');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setFormError(err.message || 'Не удалось удалить материал');
      setTimeout(() => setFormError(''), 5000);
    }
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div>
          <p className={styles.badge}>Админ-панель</p>
          <h1>Управление материалами</h1>
        </div>
        <button onClick={onClose} className={styles.homeLink}>
          ← Вернуться к игре
        </button>
      </header>

      <div className={styles.layout}>
        <section className={styles.formSection}>
          <h2>{editingId ? 'Редактировать материал' : 'Добавить новый материал'}</h2>
          <form className={styles.form} onSubmit={handleSubmit}>
            {editingId && (
              <label className={styles.label}>
                ID
                <input 
                  type='number' 
                  name='id' 
                  value={formValues.id} 
                  onChange={handleInputChange} 
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
                onChange={handleInputChange} 
                placeholder='Например, Изразцы' 
              />
            </label>

            <label className={styles.label}>
              Материал
              <select 
                name='material' 
                value={formValues.material} 
                onChange={handleInputChange}
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
                onChange={handleInputChange} 
                placeholder='https://via.placeholder.com/600x400' 
              />
            </label>

            <label className={styles.label}>
              Описание
              <textarea 
                name='description' 
                value={formValues.description} 
                onChange={handleInputChange} 
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
                onChange={handleInputChange} 
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
                <button type='button' className={styles.secondaryButton} onClick={resetForm}>
                  Отменить
                </button>
              )}
              <button type='submit' className={styles.primaryButton} disabled={saving}>
                {saving ? 'Сохраняем...' : editingId ? 'Сохранить' : 'Добавить'}
              </button>
            </div>
          </form>
        </section>
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
                <li key={material.id} className={styles.listItem}>
                  <div>
                    <p className={styles.listItemTitle}>{material.name || 'Без названия'}</p>
                    <p className={styles.listItemMeta}>Материал: {material.material}</p>
                    {material.image && (
                      <p className={styles.listItemMeta} style={{ fontSize: '12px', opacity: 0.6 }}>
                        {material.image}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button 
                      type='button' 
                      className={styles.editButton} 
                      onClick={() => startEdit(material)}
                    >
                      Редактировать
                    </button>
                    <button 
                      type='button' 
                      className={styles.editButton} 
                      onClick={() => handleDelete(material.id)}
                      style={{ background: 'rgba(255, 0, 0, 0.2)', borderColor: 'rgba(255, 0, 0, 0.5)' }}
                    >
                      Удалить
                    </button>
                  </div>
                </li>
              ))}

              {materials.length === 0 && <p className={styles.status}>Список пуст</p>}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminPage;