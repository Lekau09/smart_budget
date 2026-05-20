<?php
/**
 * DEPRECATED: Use /api/sms-ingest.php instead
 * 
 * This file has been replaced by the production-ready SMS ingest endpoint.
 * Please update your SMS Forwarder app configuration to use:
 * 
 *   POST /api/sms-ingest.php?phone_number={phone}&key={ingest_secret}
 * 
 * See backend/api/sms-ingest.php for full documentation.
 */

// For backward compatibility with older SMS Forwarder configurations
// we proxy requests internally to the production endpoint instead of
// issuing a 301 redirect which many webhook clients don't follow.
require_once __DIR__ . '/api/sms-ingest.php';
// sms-ingest.php will handle the request and emit the JSON response.
exit;
?>