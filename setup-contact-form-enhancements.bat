#!/bin/bash

# Contact Form Enhancement Migration Script
echo "Running Contact Form Enhancement Migrations..."

# Run the new migration to add message field
php artisan migrate --path=database/migrations/2025_09_10_000001_add_message_to_contact_forms_table.php

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

echo "Contact Form Enhancement completed successfully!"
echo ""
echo "Features added:"
echo "- Enhanced ContactForm model with new fields and methods"
echo "- Improved ContactController with better validation and error handling"
echo "- Admin interface for viewing and managing contact submissions"
echo "- Email notifications to admins for new contact submissions"
echo "- Bulk actions for contact management"
echo "- Better form validation and user feedback"
echo ""
echo "Admin Routes:"
echo "- /admin/contacts - View all contact submissions"
echo "- /admin/contacts/{id} - View individual contact details"
echo ""
echo "Next steps:"
echo "1. Configure email settings in .env for notifications"
echo "2. Assign admin role to users who should receive notifications"
echo "3. Test the contact form on your website"
echo "4. Check admin panel for contact management features"
