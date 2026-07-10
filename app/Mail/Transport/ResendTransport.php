<?php

namespace App\Mail\Transport;

use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\MessageConverter;
use Illuminate\Support\Facades\Http;

/**
 * Minimal Resend (resend.com) mail transport.
 *
 * Laravel 12 has no native "resend" transport and the resend/resend-laravel
 * package is not installed (and composer may not be runnable offline), so
 * this transport talks to Resend's HTTP API directly. It is registered via
 * Mail::extend('resend', ...) in AppServiceProvider; the API key comes from
 * RESEND_API_KEY in the .env.
 */
class ResendTransport extends AbstractTransport
{
    public function __construct(protected string $apiKey)
    {
        parent::__construct();
    }

    protected function doSend(SentMessage $message): void
    {
        if ($this->apiKey === '') {
            throw new \RuntimeException(
                'Resend API key is not configured. Paste it on Admin > API Keys or set RESEND_API_KEY in .env.'
            );
        }

        $email = MessageConverter::toEmail($message->getOriginalMessage());

        $payload = [
            'from' => !empty($email->getFrom())
                ? $email->getFrom()[0]->toString()
                : (config('mail.from.name') . ' <' . config('mail.from.address') . '>'),
            'to' => array_map(fn ($a) => $a->getAddress(), $email->getTo()),
            'subject' => (string) $email->getSubject(),
        ];

        if (($html = $email->getHtmlBody()) !== null && $html !== '') {
            $payload['html'] = $html;
        }
        if (($text = $email->getTextBody()) !== null && $text !== '') {
            $payload['text'] = $text;
        }
        if (!empty($email->getCc())) {
            $payload['cc'] = array_map(fn ($a) => $a->getAddress(), $email->getCc());
        }
        if (!empty($email->getBcc())) {
            $payload['bcc'] = array_map(fn ($a) => $a->getAddress(), $email->getBcc());
        }
        if (!empty($email->getReplyTo())) {
            $payload['reply_to'] = array_map(fn ($a) => $a->getAddress(), $email->getReplyTo());
        }

        $response = Http::withToken($this->apiKey)
            ->acceptJson()
            ->timeout(15)
            ->post('https://api.resend.com/emails', $payload);

        if (!$response->successful()) {
            throw new \RuntimeException(
                'Resend API returned ' . $response->status() . ': ' . $response->body()
            );
        }
    }

    public function __toString(): string
    {
        return 'resend';
    }
}
