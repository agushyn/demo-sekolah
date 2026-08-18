<?php

namespace App\Services\Rfid;

class UsbKeyboardRfidReader implements RfidReaderInterface
{
    protected bool $connected = true;

    public function connect(): bool
    {
        $this->connected = true;

        return true;
    }

    public function disconnect(): bool
    {
        $this->connected = false;

        return true;
    }

    public function readUid(): ?string
    {
        return null;
    }

    public function isConnected(): bool
    {
        return $this->connected;
    }

    /**
     * Normalize UID: Trim, remove whitespace and special characters, convert to uppercase hexadecimal.
     */
    public function normalizeUid(?string $rawUid): string
    {
        if ($rawUid === null) {
            return '';
        }

        // Clean string from non-alphanumeric characters, trim, and uppercase
        $cleaned = preg_replace('/[^a-zA-Z0-9]/', '', trim($rawUid));

        return strtoupper((string) $cleaned);
    }

    /**
     * Validate UID: check non-empty and valid hex/alphanumeric string between 4 and 32 characters.
     */
    public function validateUid(string $uid): bool
    {
        $normalized = $this->normalizeUid($uid);

        if (strlen($normalized) < 4 || strlen($normalized) > 32) {
            return false;
        }

        return (bool) preg_match('/^[A-Z0-9]+$/', $normalized);
    }
}
