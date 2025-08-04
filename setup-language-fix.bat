@echo off
echo Setting up Language Switcher and Property Fix...
echo.

echo Copy these files to your project:
echo.
echo 1. Translation System:
echo From: F:\noburesidence\NOBU\laravel-react-starter\resources\js\utils\translations.js
echo To:   E:\Proprio-Link\webapp\laravel-react-app\resources\js\utils\translations.js
echo.

echo 2. Property Utils:
echo From: F:\noburesidence\NOBU\laravel-react-starter\resources\js\utils\propertyUtils.js
echo To:   E:\Proprio-Link\webapp\laravel-react-app\resources\js\utils\propertyUtils.js
echo.

echo 3. Language Switcher Component:
echo From: F:\noburesidence\NOBU\laravel-react-starter\resources\js\components\LanguageSwitcher.jsx
echo To:   E:\Proprio-Link\webapp\laravel-react-app\resources\js\components\LanguageSwitcher.jsx
echo.

echo 4. Fixed Properties Component:
echo From: F:\noburesidence\NOBU\laravel-react-starter\resources\js\components\PropertiesComponent.jsx
echo To:   E:\Proprio-Link\webapp\laravel-react-app\resources\js\components\PropertiesComponent.jsx
echo.

echo =====================================================
echo PowerShell copy commands:
echo =====================================================
echo.
echo # Create directories
echo New-Item -ItemType Directory -Force -Path "E:\Proprio-Link\webapp\laravel-react-app\resources\js\utils"
echo New-Item -ItemType Directory -Force -Path "E:\Proprio-Link\webapp\laravel-react-app\resources\js\components"
echo.
echo # Copy files
echo Copy-Item "F:\noburesidence\NOBU\laravel-react-starter\resources\js\utils\translations.js" -Destination "E:\Proprio-Link\webapp\laravel-react-app\resources\js\utils\" -Force
echo Copy-Item "F:\noburesidence\NOBU\laravel-react-starter\resources\js\utils\propertyUtils.js" -Destination "E:\Proprio-Link\webapp\laravel-react-app\resources\js\utils\" -Force
echo Copy-Item "F:\noburesidence\NOBU\laravel-react-starter\resources\js\components\LanguageSwitcher.jsx" -Destination "E:\Proprio-Link\webapp\laravel-react-app\resources\js\components\" -Force
echo Copy-Item "F:\noburesidence\NOBU\laravel-react-starter\resources\js\components\PropertiesComponent.jsx" -Destination "E:\Proprio-Link\webapp\laravel-react-app\resources\js\components\" -Force
echo.

echo =====================================================
echo Next Steps:
echo =====================================================
echo.
echo 1. Copy the files using the PowerShell commands above
echo 2. Import the translation system in your app.jsx:
echo    import './utils/translations';
echo.
echo 3. Replace your existing Properties component with the new one
echo.
echo 4. Add the LanguageSwitcher to your layout:
echo    import LanguageSwitcher from './components/LanguageSwitcher';
echo.
echo 5. Use translations in components:
echo    import translationManager from './utils/translations';
echo    const t = ^(key^) =^> translationManager.translate^(key^);
echo.

pause
