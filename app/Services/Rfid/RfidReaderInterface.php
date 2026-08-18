<?php

namespace App\Services\Rfid;

interface RfidReaderInterface
{
    /**
     * Connect to the RFID reader device.
     */
    public function connect(): bool;

    /**
     * Disconnect from the RFID reader device.
     */
    public function disconnect(): bool;

    /**
     * Read the raw RFID UID from the stream/input.
     */
    public function readUid(): ?string;

    /**
     * Check if reader is connected and active.
     */
    public function isConnected(): bool;

    /**
     * Normalize the raw RFID UID (trim, remove non-hex chars, uppercase).
     */
    public function normalizeUid(?string $rawUid): string;

    /**
     * Validate the RFID UID format.
     */
    public function validateUid(string $uid): bool;
}
