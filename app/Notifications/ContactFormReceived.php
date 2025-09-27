<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\ContactForm;

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
        return (new MailMessage)
                    ->subject('New Contact Form Submission - ' . $this->contact->name)
                    ->greeting('New Contact Inquiry')
                    ->line('A new contact form has been submitted on your website.')
                    ->line('**Name:** ' . $this->contact->name)
                    ->line('**Email:** ' . $this->contact->email)
                    ->line('**Phone:** ' . ($this->contact->phone ?: 'Not provided'))
                    ->line('**Categories:** ' . $this->contact->formatted_categories)
                    ->when($this->contact->message, function ($mail) {
                        return $mail->line('**Message:** ' . $this->contact->message);
                    })
                    ->action('View in Admin Panel', url('/admin/contacts/' . $this->contact->id))
                    ->line('Please respond to this inquiry as soon as possible.');
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
