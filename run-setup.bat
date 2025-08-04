@echo off
echo Setting up address protection system...
echo.

echo Running migration for contact purchases...
php artisan migrate --path=database/migrations/2025_08_04_000004_create_contact_purchases_simple_table.php

echo.
echo Setup complete!
echo.
echo Now test by visiting:
echo http://127.0.0.1:8000/agent/properties/dba2b835-2239-486a-8ca0-57ece3badbc4
echo.
echo Expected result:
echo - Address should show as: "XXX XXXXXXXXX XXXXXX, 13000 Marseille"
echo - Red warning banner at top
echo - Purchase modal when clicking purchase link
echo.
echo If you see the full address, something is wrong!
echo.
pause
