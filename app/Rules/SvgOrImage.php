<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;
use Illuminate\Http\UploadedFile;

class SvgOrImage implements Rule
{
    /**
     * Create a new rule instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Determine if the validation rule passes.
     *
     * @param  string  $attribute
     * @param  mixed  $value
     * @return bool
     */
    public function passes($attribute, $value)
    {
        if (!$value instanceof UploadedFile) {
            return false;
        }

        // Check if it's a regular image
        $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        $extension = strtolower($value->getClientOriginalExtension());

        if (in_array($extension, $imageExtensions)) {
            return @getimagesize($value->getRealPath()) !== false;
        }

        // Check if it's an SVG
        if ($extension === 'svg') {
            $content = file_get_contents($value->getRealPath());
            return strpos($content, '<svg') !== false || strpos($content, '<?xml') !== false;
        }

        return false;
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return 'The :attribute must be a valid image (JPG, PNG, GIF, WebP) or SVG file.';
    }
}