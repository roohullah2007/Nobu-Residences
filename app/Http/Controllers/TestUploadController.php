<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TestUploadController extends Controller
{
    public function testUpload(Request $request)
    {
        Log::info('Test upload endpoint hit', [
            'method' => $request->method(),
            'has_files' => $request->hasFile('test_file'),
            'all_files' => $request->allFiles(),
            'content_type' => $request->header('Content-Type'),
        ]);

        if ($request->hasFile('test_file')) {
            $file = $request->file('test_file');
            Log::info('File received!', [
                'name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
            ]);
            return response()->json(['success' => true, 'message' => 'File received']);
        }

        return response()->json(['success' => false, 'message' => 'No file received']);
    }
}