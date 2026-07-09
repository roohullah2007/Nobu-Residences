<?php

namespace App\Support;

/**
 * Small builders for schema.org JSON-LD objects rendered server-side by
 * app.blade.php via the per-page `seo.jsonLd` prop.
 */
class Schema
{
    /**
     * FAQPage schema from a collection of FAQs ({question, answer}).
     * Returns null when empty so callers can array_filter it away.
     */
    public static function faqPage(iterable $faqs): ?array
    {
        $entities = [];
        foreach ($faqs as $faq) {
            $question = is_array($faq) ? ($faq['question'] ?? '') : $faq->question;
            $answer = is_array($faq) ? ($faq['answer'] ?? '') : $faq->answer;
            if ($question === '' || $answer === '') {
                continue;
            }
            $entities[] = [
                '@type' => 'Question',
                'name' => $question,
                'acceptedAnswer' => [
                    '@type' => 'Answer',
                    'text' => $answer,
                ],
            ];
        }

        if (empty($entities)) {
            return null;
        }

        return [
            '@context' => 'https://schema.org',
            '@type' => 'FAQPage',
            'mainEntity' => $entities,
        ];
    }
}
