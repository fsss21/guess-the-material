/* eslint-env node */
const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const { existsSync } = require('fs');
const { platform } = require('os');

const app = express();
const PORT = 3001;

// Определяем путь к папке dist
// При запуске через pkg, пути к файлам отличаются
const fs = require('fs');
let distPath;

if (process.pkg) {
  // При запуске через pkg, assets находятся в snapshot
  // Пробуем разные возможные пути
  const possiblePaths = [
    path.join(__dirname, 'dist'), // /snapshot/architects-office/dist
    path.join(__dirname, '../dist'), // альтернативный путь
    path.dirname(process.execPath), // рядом с исполняемым файлом
    path.join(path.dirname(process.execPath), 'dist'), // dist рядом с exe
  ];

  // Ищем существующий путь
  for (const testPath of possiblePaths) {
    if (existsSync(testPath) && existsSync(path.join(testPath, 'index.html'))) {
      distPath = testPath;
      console.log('PKG mode - Found dist at:', distPath);
      break;
    }
  }

  // Если не нашли, используем __dirname/dist и выводим отладочную информацию
  if (!distPath) {
    distPath = path.join(__dirname, 'dist');
    console.log('PKG mode - __dirname:', __dirname);
    console.log('PKG mode - process.execPath:', process.execPath);
    console.log('PKG mode - distPath:', distPath);

    // Список файлов в __dirname для отладки
    try {
      const files = fs.readdirSync(__dirname);
      console.log('PKG mode - files in __dirname:', files);
    } catch (e) {
      console.log('PKG mode - cannot read __dirname:', e.message);
    }

    // Проверяем dist папку
    try {
      if (existsSync(distPath)) {
        const distFiles = fs.readdirSync(distPath);
        console.log('PKG mode - files in dist:', distFiles);
      } else {
        console.log('PKG mode - dist folder does not exist at:', distPath);
      }
    } catch (e) {
      console.log('PKG mode - cannot read dist:', e.message);
    }
  }
} else {
  // При обычном запуске, dist находится рядом с server.cjs
  distPath = path.join(__dirname, 'dist');
}

// Обслуживание статических файлов из папки dist
app.use(express.static(distPath));

// Для всех остальных маршрутов возвращаем index.html (SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Функция для запуска браузера в киоск-режиме
function launchBrowser() {
  const currentPlatform = platform();
  const url = `http://localhost:${PORT}/`;

  setTimeout(() => {
    if (currentPlatform === 'win32') {
      // Windows
      const chromePath = process.env['ProgramFiles'] + '\\Google\\Chrome\\Application\\chrome.exe';
      const edgePath = process.env['ProgramFiles(x86)'] + '\\Microsoft\\Edge\\Application\\msedge.exe';

      if (existsSync(chromePath)) {
        // Запуск Chrome в киоск-режиме
        const chromeArgs = [
          '--disable-web-security',
          `--user-data-dir="${process.env.TEMP}\\ChromeTempProfile"`,
          '--autoplay-policy=no-user-gesture-required',
          `--app="${url}"`,
          '--start-fullscreen',
          '--kiosk',
          '--disable-features=Translate,ContextMenuSearchWebFor,ImageSearch',
        ].join(' ');

        exec(`"${chromePath}" ${chromeArgs}`, (error) => {
          if (error) {
            console.error('Ошибка запуска Chrome:', error);
          }
        });
      } else if (existsSync(edgePath)) {
        // Настройка реестра для Edge (требует прав администратора)
        const regCommands = [
          'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge" /v "TranslateEnabled" /t REG_DWORD /d 0 /f',
          'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge" /v "ContextMenuSearchEnabled" /t REG_DWORD /d 0 /f',
          'reg add "HKLM\\SOFTWARE\\Policies\\Microsoft\\Edge" /v "VisualSearchEnabled" /t REG_DWORD /d 0 /f',
        ];

        // Выполняем команды реестра (могут не сработать без прав администратора)
        regCommands.forEach((cmd) => {
          exec(cmd, () => {}); // Игнорируем ошибки, если нет прав
        });

        // Запуск Edge в киоск-режиме
        const edgeArgs = [
          `--kiosk "${url}"`,
          '--edge-kiosk-type=fullscreen',
          '--no-first-run',
          '--disable-features=msEdgeSidebarV2,msHub,msWelcomePage,msTranslations,msContextMenuSearch,msVisualSearch',
          '--disable-component-update',
          '--disable-prompt-on-repost',
          '--kiosk-idle-timeout-minutes=0',
        ].join(' ');

        exec(`"${edgePath}" ${edgeArgs}`, (error) => {
          if (error) {
            console.error('Ошибка запуска Edge:', error);
          }
        });
      } else {
        console.log('Не найден ни Chrome, ни Edge. Откройте браузер вручную.');
        console.log(`URL: ${url}`);
      }

      // Убиваем explorer.exe через 12 секунд (опционально, можно закомментировать)
      setTimeout(() => {
        console.log('Kill Explorer...');
        exec('taskkill /f /im explorer.exe', (error) => {
          if (error) {
            // Игнорируем ошибки, если нет прав или explorer уже закрыт
          }
        });
      }, 12000);
    } else if (currentPlatform === 'darwin') {
      // macOS
      const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
      const safariPath = '/Applications/Safari.app';
      const edgePath = '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';

      if (existsSync(chromePath)) {
        // Запуск Chrome в киоск-режиме на macOS
        const chromeArgs = [
          '--disable-web-security',
          `--user-data-dir="${process.env.TMPDIR || '/tmp'}/ChromeTempProfile"`,
          '--autoplay-policy=no-user-gesture-required',
          `--app="${url}"`,
          '--start-fullscreen',
          '--kiosk',
          '--disable-features=Translate,ContextMenuSearchWebFor,ImageSearch',
        ].join(' ');

        exec(`"${chromePath}" ${chromeArgs}`, (error) => {
          if (error) {
            console.error('Ошибка запуска Chrome:', error);
          }
        });
      } else if (existsSync(edgePath)) {
        // Запуск Edge в киоск-режиме на macOS
        const edgeArgs = [
          `--kiosk "${url}"`,
          '--edge-kiosk-type=fullscreen',
          '--no-first-run',
          '--disable-features=msEdgeSidebarV2,msHub,msWelcomePage,msTranslations,msContextMenuSearch,msVisualSearch',
        ].join(' ');

        exec(`"${edgePath}" ${edgeArgs}`, (error) => {
          if (error) {
            console.error('Ошибка запуска Edge:', error);
          }
        });
      } else if (existsSync(safariPath)) {
        // Запуск Safari (без киоск-режима, так как Safari не поддерживает флаги командной строки)
        exec(`open -a Safari "${url}"`, (error) => {
          if (error) {
            console.error('Ошибка запуска Safari:', error);
          } else {
            console.log('Safari открыт. Для полноэкранного режима нажмите Cmd+Ctrl+F');
          }
        });
      } else {
        console.log('Не найден ни Chrome, ни Edge, ни Safari. Откройте браузер вручную.');
        console.log(`URL: ${url}`);
      }
    } else {
      console.log('Автоматический запуск браузера доступен только на Windows и macOS');
      console.log(`Откройте браузер вручную: ${url}`);
    }
  }, 3000); // Ждем 3 секунды после запуска сервера
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Serving files from: ${distPath}`);

  // Запускаем браузер автоматически (Windows и macOS)
  if (platform() === 'win32' || platform() === 'darwin') {
    launchBrowser();
  }
});
