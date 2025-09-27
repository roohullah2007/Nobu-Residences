# Manual Setup Instructions

## Step 1: Run Migration
Open your command prompt in the Laravel project folder and run:

```bash
php artisan migrate --path=database/migrations/2025_08_04_000004_create_contact_purchases_simple_table.php
```

## Step 2: Test the Setup
Visit: http://127.0.0.1:8000/agent/properties/dba2b835-2239-486a-8ca0-57ece3badbc4

## Expected Results:
✅ Address should be masked: "XXX XXXXXXXXX XXXXXX, 13000 Marseille"
✅ Red warning banner at the top of the page
✅ Purchase modal when clicking purchase link

## If It's Not Working:
1. Make sure your Laravel app is running: `php artisan serve`
2. Check for any errors in the browser console (F12)
3. Verify the middleware is loaded by checking `bootstrap/app.php`

## Troubleshooting:
- If you see the full address, the middleware isn't working
- If you get a 404, make sure the route exists in `routes/web.php`
- If purchase doesn't work, check the CSRF token is present

## Test Commands:
```bash
# Test address masking logic
php test-masking.php

# Check if middleware is registered
php artisan route:list | grep agent
```
