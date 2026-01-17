import { useCallback, useEffect, useState } from 'react'
import styles from './AdminPage.module.css'
import MaterialForm from './MaterialForm'
import MaterialList from './MaterialList'

const emptyForm = {
  name: '',
  material: '',
  image: '',
  description: '',
  category: '',
}

const AdminPage = ({ onClose }) => {
  const [materials, setMaterials] = useState([])
  const [formValues, setFormValues] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const loadMaterials = useCallback(async () => {
    setLoading(true)
    setListError('')
    try {
      const response = await fetch('/api/materials')
      if (!response.ok) {
        throw new Error('Не удалось загрузить материалы')
      }
      const data = await response.json()
      setMaterials(Array.isArray(data) ? data : [])
    } catch (err) {
      setListError(err.message || 'Не удалось получить список материалов')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMaterials()
  }, [loadMaterials])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const startEdit = (material) => {
    setEditingId(material.id)
    setFormValues({
      id: material.id || '',
      name: material.name || '',
      material: material.material || '',
      image: material.image || '',
      description: material.description || '',
      category: material.category || '',
    })
    setFormError('')
    setSuccessMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setEditingId(null)
    setFormValues(emptyForm)
    setFormError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setFormError('')
    setSuccessMessage('')
    setSaving(true)

    const payload = {
      name: formValues.name.trim(),
      material: formValues.material.trim(),
      image: formValues.image.trim(),
      description: formValues.description.trim(),
      category: formValues.category.trim(),
    }

    if (!payload.name || !payload.material || !payload.description) {
      setFormError('Название, материал и описание обязательны')
      setSaving(false)
      return
    }

    try {
      let response
      if (editingId) {
        const updatePayload = { ...payload }
        if (formValues.id && parseInt(formValues.id) !== editingId) {
          updatePayload.id = parseInt(formValues.id)
        }
        response = await fetch(`/api/materials/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Не удалось обновить материал')
        }
        
        const updatedMaterial = await response.json()
        setMaterials(materials.map(m => m.id === editingId ? updatedMaterial : m))
        setSuccessMessage('Материал обновлён')
      } else {
        response = await fetch('/api/materials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Не удалось создать материал')
        }
        
        const newMaterial = await response.json()
        setMaterials([...materials, newMaterial])
        setSuccessMessage('Материал добавлен')
      }
      
      resetForm()
    } catch (err) {
      setFormError(err.message || 'Не удалось сохранить изменения')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот материал?')) {
      return
    }

    try {
      const response = await fetch(`/api/materials/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Не удалось удалить материал')
      }

      setMaterials(materials.filter(m => m.id !== id))
      setSuccessMessage('Материал удалён')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setFormError(err.message || 'Не удалось удалить материал')
      setTimeout(() => setFormError(''), 5000)
    }
  }

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
        <MaterialForm
          formValues={formValues}
          editingId={editingId}
          formError={formError}
          successMessage={successMessage}
          saving={saving}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          onReset={resetForm}
        />
        
        <MaterialList
          materials={materials}
          loading={loading}
          listError={listError}
          onEdit={startEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}

export default AdminPage