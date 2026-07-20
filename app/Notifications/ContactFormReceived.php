<?php

namespace App\Notifications;

use App\Models\ContactForm;
use App\Support\EmailBranding;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * "New contact form submission" email to the site admins, on the shared
 * site-branded template (emails/branded.blade.php) — never the stock
 * Laravel markdown layout.
 */
class ContactFormReceived extends Notification
{
    use Queueable;

    protected $contact;

    /**
     * Create a new notification instance.
     */
    public function __construct(ContactForm $contact)
    {
        $this->contact = $contact;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $branding = EmailBranding::current();

        $rows = array_filter([
            'Name' => $this->contact->name,
            'Email' => $this->contact->email,
            'Phone' => $this->contact->phone ?: 'Not provided',
            'Categories' => $this->contact->formatted_categories,
            'Message' => $this->contact->message ?: null,
        ]);

        return (new MailMessage)
            ->subject('New Contact Form Submission - ' . $this->contact->name)
            ->view('emails.branded', [
                'siteName' => $branding['siteName'],
                'logoUrl' => $branding['logoUrl'],
                'title' => 'New contact inquiry',
                'paragraphs' => ['A new contact form has been submitted on your website.'],
                'rows' => $rows,
                'buttonText' => 'View in admin panel',
                'buttonUrl' => url('/admin/contacts/' . $this->contact->id),
                'footnote' => 'Please respond to this inquiry as soon as possible.',
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'contact_form',
            'contact_id' => $this->contact->id,
            'name' => $this->contact->name,
            'email' => $this->contact->email,
            'categories' => $this->contact->formatted_categories,
            'message' => 'New contact form submission from ' . $this->contact->name,
        ];
    }
}
