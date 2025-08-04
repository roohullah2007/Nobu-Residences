@echo off
echo Dropping all tables...
php artisan migrate:fresh

echo Running migrations...
php artisan migrate

echo Seeding data...
php artisan db:seed --class=AgentPropertySeeder

echo Setup complete! You can now test at:
echo http://127.0.0.1:8000/agent/properties/dba2b835-2239-486a-8ca0-57ece3badbc4
pause
