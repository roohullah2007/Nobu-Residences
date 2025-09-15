@echo off
echo Setting up building amenities data...
echo.

echo Running setup script...
php setup-building-amenities.php

echo.
echo Testing amenities data...
php test-amenities-data.php

echo.
echo Setup complete! 
echo You can now test the amenities display on property detail pages.
echo.
pause
