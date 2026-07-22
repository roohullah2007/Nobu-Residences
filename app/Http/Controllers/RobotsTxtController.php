<?php

namespace App\Http\Controllers;

use App\Services\Tenancy\TenantResolver;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Dynamic /robots.txt (replaces the old static public/robots.txt) so each
 * tenant domain can advertise ITS sitemap. Content is otherwise identical to
 * the static file: search engines welcome, AI-training / SEO-intelligence /
 * copier bots disallowed (enforced server-side by BlockScrapers anyway).
 * The admin host gets the same rules without a Sitemap line (it serves no
 * public site, so it has no sitemap).
 */
class RobotsTxtController extends Controller
{
    private const BLOCKED_BOTS = [
        'GPTBot', 'ChatGPT-User', 'OAI-SearchBot', 'ClaudeBot', 'Claude-Web',
        'anthropic-ai', 'CCBot', 'Google-Extended', 'Applebot-Extended',
        'Bytespider', 'PerplexityBot', 'Amazonbot', 'Diffbot', 'ImagesiftBot',
        'omgili', 'omgilibot', 'cohere-ai', 'Timpibot', 'YouBot', 'AI2Bot',
        'Meta-ExternalAgent', 'AhrefsBot', 'SemrushBot', 'MJ12bot', 'DotBot',
        'BLEXBot', 'DataForSeoBot', 'serpstatbot', 'ZoominfoBot', 'Barkrowler',
        'MegaIndex', 'SEOkicks', 'HTTrack', 'WebCopier',
    ];

    public function __construct(private TenantResolver $resolver)
    {
    }

    public function __invoke(Request $request): Response
    {
        $lines = [
            '# Search engines and social link previews are welcome.',
            '# AI-training crawlers, SEO-intelligence bots and site copiers are not.',
            '# (Enforced server-side too - this file is advisory.)',
            '',
        ];

        foreach (self::BLOCKED_BOTS as $bot) {
            $lines[] = 'User-agent: ' . $bot;
        }
        $lines[] = 'Disallow: /';
        $lines[] = '';
        $lines[] = 'User-agent: *';
        $lines[] = 'Disallow: /login';
        $lines[] = 'Disallow: /register';
        $lines[] = 'Disallow: /forgot-password';
        $lines[] = 'Disallow: /dashboard';
        $lines[] = 'Disallow: /profile';

        if ($this->resolver->resolve($request)) {
            $lines[] = '';
            $lines[] = 'Sitemap: ' . rtrim($request->getSchemeAndHttpHost(), '/') . '/sitemap.xml';
        }

        return response(implode("\n", $lines) . "\n", 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }
}
