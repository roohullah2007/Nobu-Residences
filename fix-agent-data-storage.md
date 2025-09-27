# Fix Agent Data Storage Issue

## Problem
Agent information and photo uploads are not being saved properly in the backend.

## Solution

### 1. Add Missing Agent Email Field in Edit.jsx

In `resources/js/Pages/Admin/Websites/Edit.jsx`, add the missing agent email field:

#### Step 1: Add to form data state (around line 37):
```javascript
// BEFORE:
'contact_info.agent.name': website?.contact_info?.agent?.name || '',
'contact_info.agent.title': website?.contact_info?.agent?.title || '',
'contact_info.agent.phone': website?.contact_info?.agent?.phone || '',
'contact_info.agent.brokerage': website?.contact_info?.agent?.brokerage || '',

// AFTER:
'contact_info.agent.name': website?.contact_info?.agent?.name || '',
'contact_info.agent.title': website?.contact_info?.agent?.title || '',
'contact_info.agent.email': website?.contact_info?.agent?.email || '',  // ADD THIS LINE
'contact_info.agent.phone': website?.contact_info?.agent?.phone || '',
'contact_info.agent.brokerage': website?.contact_info?.agent?.brokerage || '',
```

#### Step 2: Add email input field in the form (around line 577, after Agent Title field):
```jsx
// Add this after the Agent Title field and before Agent Phone field:
<div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Agent Email</label>
    <input
        type="email"
        value={data['contact_info.agent.email']}
        onChange={(e) => setData('contact_info.agent.email', e.target.value)}
        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        placeholder="agent@example.com"
    />
</div>
```

### 2. Update Backend Controller Validation

In `app/Http/Controllers/Admin/WebsiteManagementController.php`, add agent email validation (around line 205):

```php
// Add this line to the validation rules:
'contact_info.agent.email' => 'nullable|email|max:255',
```

So the validation section should look like:
```php
'contact_info' => 'nullable|array',
'contact_info.agent.name' => 'nullable|string|max:255',
'contact_info.agent.title' => 'nullable|string|max:255',
'contact_info.agent.email' => 'nullable|email|max:255',  // ADD THIS
'contact_info.agent.phone' => 'nullable|string|max:255',
'contact_info.agent.brokerage' => 'nullable|string|max:255',
'contact_info.agent.image' => 'nullable|string',
'agent_image_file' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:2048',
```

### 3. Ensure Proper Data Merging

The controller already handles nested data properly, but make sure the contact_info is properly merged when updating. The existing code should work correctly with these changes.

## Testing

After making these changes:

1. Go to `/admin/websites/1/edit`
2. Fill in the agent information:
   - Agent Name
   - Agent Title
   - Agent Email (new field)
   - Agent Phone
   - Brokerage
3. Upload an agent photo
4. Click "Save Changes"

The data should now save successfully and be available throughout the application.

## Verification

To verify the data is saved:
1. Refresh the edit page - all agent info should persist
2. Check the database: `websites` table, `contact_info` column should contain the agent data
3. The contact agent modals throughout the site should now show the saved agent information

## Common Issues

If you still see errors:
1. Clear browser cache
2. Run `php artisan config:clear`
3. Run `php artisan cache:clear`
4. Ensure storage link is created: `php artisan storage:link`
5. Check file permissions on `storage/app/public/agents` directory