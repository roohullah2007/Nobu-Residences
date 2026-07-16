<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Refuse known scrapers, AI-training crawlers, HTTP libraries and security
 * scanners on the public sites with a bare 403 — robots.txt is advisory
 * only, so the block has to happen server-side too.
 *
 * Deliberately NOT blocked: real browsers, search engines (Googlebot,
 * Bingbot, DuckDuckBot, Applebot...) and social/link-preview bots
 * (facebookexternalhit, WhatsApp, Twitterbot, Slackbot, TelegramBot) —
 * SEO and WhatsApp/social sharing of landing pages must keep working.
 */
class BlockScrapers
{
    /**
     * Case-insensitive User-Agent substrings that get a 403.
     *
     * @var list<string>
     */
    protected array $blocked = [
        // HTTP libraries / naive scrapers
        'python-requests', 'python-urllib', 'aiohttp', 'httpx', 'scrapy',
        'go-http-client', 'libwww-perl', 'okhttp', 'java/', 'phantomjs',
        'curl/', 'wget/', 'httrack', 'webcopier', 'webzip', 'node-fetch',
        'axios/', 'guzzlehttp',

        // AI-training / LLM crawlers (several ignore robots.txt)
        'gptbot', 'chatgpt-user', 'oai-searchbot', 'claudebot', 'claude-web',
        'anthropic-ai', 'ccbot', 'bytespider', 'perplexitybot', 'amazonbot',
        'diffbot', 'imagesiftbot', 'omgili', 'cohere-ai', 'timpibot',
        'youbot', 'ai2bot', 'meta-externalagent',

        // SEO-intelligence crawlers (power competitor/owner-correlation tools)
        'ahrefsbot', 'semrushbot', 'mj12bot', 'dotbot', 'blexbot',
        'dataforseobot', 'serpstatbot', 'zoominfobot', 'barkrowler',
        'megaindex', 'seokicks', 'builtwith',

        // Security scanners
        'sqlmap', 'nikto', 'nuclei', 'wpscan', 'masscan', 'zgrab',
        'gobuster', 'dirbuster', 'feroxbuster', 'nessus', 'acunetix',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $agent = (string) $request->userAgent();

        // Real browsers always send a User-Agent; an empty one is a script.
        if ($agent === '' || Str::contains(Str::lower($agent), $this->blocked)) {
            abort(403);
        }

        return $next($request);
    }
}
