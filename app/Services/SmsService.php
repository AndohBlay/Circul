<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsService
{
    protected string $apiKey;
    protected string $senderId;

    public function __construct()
    {
        $this->apiKey   = config('services.arkesel.api_key');
        $this->senderId = config('services.arkesel.sender_id');
    }

    public function send(string $phone, string $message): bool
    {
        try {
            $response = Http::get('https://sms.arkesel.com/sms/api', [
                'action'  => 'send-sms',
                'api_key' => $this->apiKey,
                'to'      => $phone,
                'from'    => $this->senderId,
                'sms'     => $message,
            ]);

            $result = $response->json();

            if (isset($result['code']) && $result['code'] === 'ok') {
                return true;
            }

            Log::error('Arkesel SMS failed', ['response' => $result, 'phone' => $phone]);
            return false;

        } catch (\Exception $e) {
            Log::error('Arkesel SMS exception', ['error' => $e->getMessage(), 'phone' => $phone]);
            return false;
        }
    }
}
