const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const ServerSetup = require('./utils/serverSetup');

const app = express();

// Инициализация ServerSetup для управления путями, запуском сервера и браузера
const serverSetup = new ServerSetup();

// Переменная для хранения пути к файлу данных (будет установлена при инициализации)
let DATA_FILE = null;

// Middleware
app.use(cors());
app.use(express.json());

// Инициализация файла данных
async function initializeData() {
  try {
    // Получаем путь к файлу данных (с проверкой существования)
    DATA_FILE = await serverSetup.getDataFile();
    
    // Инициализируем директорию данных через ServerSetup
    await serverSetup.initializeDataDir();

    // Проверяем существование файла и создаем, если его нет
    const dataExists = await fs.pathExists(DATA_FILE);
    if (!dataExists) {
      // Создаем пустой файл, если его нет
      const initialData = [];
      await fs.writeJson(DATA_FILE, initialData, { spaces: 2 });
      console.log('✅ Создан новый файл данных');
    }
  } catch (error) {
    console.error('❌ Ошибка инициализации данных:', error);
    console.error('❌ Путь к файлу:', DATA_FILE);
  }
}

// Чтение данных из файла
async function readMaterials() {
  try {
    // Убеждаемся, что путь к файлу установлен
    if (!DATA_FILE) {
      DATA_FILE = await serverSetup.getDataFile();
    }
    
    const exists = await fs.pathExists(DATA_FILE);
    if (exists) {
      const data = await fs.readJson(DATA_FILE);
      console.log(`📖 Прочитано ${Array.isArray(data) ? data.length : 0} материалов из файла`);
      return data;
    }
    console.warn(`⚠️  Файл данных не найден: ${DATA_FILE}`);
    return [];
  } catch (error) {
    console.error('❌ Ошибка чтения данных:', error);
    console.error('❌ Путь к файлу:', DATA_FILE);
    return [];
  }
}

// Запись данных в файл
async function writeMaterials(materials) {
  try {
    // Убеждаемся, что путь к файлу установлен
    if (!DATA_FILE) {
      DATA_FILE = await serverSetup.getDataFile();
    }
    
    // Убеждаемся, что директория существует
    await fs.ensureDir(path.dirname(DATA_FILE));
    
    await fs.writeJson(DATA_FILE, materials, { spaces: 2 });
    return true;
  } catch (error) {
    console.error('❌ Ошибка записи данных:', error);
    return false;
  }
}

// API Routes

// GET /api/materials - получить все материалы
app.get('/api/materials', async (req, res) => {
  try {
    const materials = await readMaterials();
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения данных' });
  }
});

// GET /api/materials/:id - получить материал по ID
app.get('/api/materials/:id', async (req, res) => {
  try {
    const materials = await readMaterials();
    const material = materials.find((m) => m.id === parseInt(req.params.id));

    if (!material) {
      return res.status(404).json({ error: 'Материал не найден' });
    }

    res.json(material);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка получения данных' });
  }
});

// POST /api/materials - создать новый материал
app.post('/api/materials', async (req, res) => {
  try {
    const materials = await readMaterials();
    const newMaterial = {
      ...req.body,
      id: Date.now(), // Простой ID генератор
    };

    materials.push(newMaterial);
    const success = await writeMaterials(materials);

    if (success) {
      res.status(201).json(newMaterial);
    } else {
      res.status(500).json({ error: 'Ошибка сохранения данных' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка создания материала' });
  }
});

// PUT /api/materials/:id - обновить материал
app.put('/api/materials/:id', async (req, res) => {
  try {
    const materials = await readMaterials();
    const oldId = parseInt(req.params.id);
    const materialIndex = materials.findIndex((m) => m.id === oldId);

    if (materialIndex === -1) {
      return res.status(404).json({ error: 'Материал не найден' });
    }

    // Если ID изменяется, проверяем конфликты
    if (req.body.id && req.body.id !== oldId) {
      const newId = parseInt(req.body.id);

      // Проверяем, что новый ID не занят другим материалом
      const idExists = materials.some((m, index) => m.id === newId && index !== materialIndex);
      if (idExists) {
        return res.status(400).json({ error: `ID ${newId} уже используется другим материалом` });
      }

      // Обновляем материал с новым ID
      materials[materialIndex] = { ...materials[materialIndex], ...req.body, id: newId };
    } else {
      // Обновляем без изменения ID (или если ID не указан в body)
      const { id, ...updateData } = req.body; // Исключаем id из обновления, если он не меняется
      materials[materialIndex] = { ...materials[materialIndex], ...updateData };
    }

    const success = await writeMaterials(materials);

    if (success) {
      res.json(materials[materialIndex]);
    } else {
      res.status(500).json({ error: 'Ошибка сохранения данных' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка обновления материала' });
  }
});

// DELETE /api/materials/:id - удалить материал
app.delete('/api/materials/:id', async (req, res) => {
  try {
    const materials = await readMaterials();
    const filteredMaterials = materials.filter((m) => m.id !== parseInt(req.params.id));

    if (materials.length === filteredMaterials.length) {
      return res.status(404).json({ error: 'Материал не найден' });
    }

    const success = await writeMaterials(filteredMaterials);

    if (success) {
      res.json({ message: 'Материал успешно удален' });
    } else {
      res.status(500).json({ error: 'Ошибка сохранения данных' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Ошибка удаления материала' });
  }
});

// Настройка статических файлов через ServerSetup
// Размещено после API маршрутов, чтобы API запросы обрабатывались первыми
serverSetup.setupStaticFiles(app, express);

// Запуск сервера
async function startServer() {
  await initializeData();

  // Используем ServerSetup для запуска сервера и открытия браузера
  await serverSetup.startServer(app, async () => {
    // Дополнительная логика после запуска сервера (опционально)
    const buildDir = serverSetup.getBuildDir();

    // Проверяем наличие изображений
    const imagesDir = path.join(buildDir, 'images');
    fs.pathExists(imagesDir).then((exists) => {
      if (exists) {
        console.log(`✅ Папка images найдена: ${imagesDir}`);
      } else {
        console.warn(`⚠️  Папка images не найдена: ${imagesDir}`);
      }
    });
  });
}

startServer().catch(console.error);
