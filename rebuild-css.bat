@echo off
echo Rebuilding CSS and JS assets...

rem Install dependencies if needed
npm install

rem Build assets
npm run build

echo CSS and JS assets have been rebuilt!
echo Please refresh your browser to see the changes.
pause
