@echo off
echo === Fixing NOBU Residences Amenities ===
echo.

cd /d "%~dp0"

echo Running amenities fix...
php fix-amenities-complete.php

echo.
echo === Fix completed ===
echo.
echo Please refresh your browser to see the changes.
echo.
pause
