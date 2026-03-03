<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Method not allowed']);
    http_response_code(405);
    exit;
}

$message = $_POST['message'] ?? '';
$sessionId = $_POST['sessionId'] ?? '';

// Handle audio upload
$audioData = null;
$audioFileName = null;
if (isset($_FILES['audio']) && $_FILES['audio']['error'] === UPLOAD_ERR_OK) {
    $audioData = base64_encode(file_get_contents($_FILES['audio']['tmp_name']));
    $audioFileName = $_FILES['audio']['name'];
    $audioMimeType = $_FILES['audio']['type'];
}

// Handle file attachment
$attachmentData = null;
$attachmentFileName = null;
if (isset($_FILES['attachment']) && $_FILES['attachment']['error'] === UPLOAD_ERR_OK) {
    $attachmentData = base64_encode(file_get_contents($_FILES['attachment']['tmp_name']));
    $attachmentFileName = $_FILES['attachment']['name'];
    $attachmentMimeType = $_FILES['attachment']['type'];
}

// Configuration - UPDATE THIS TO YOUR N8N WEBHOOK URL
$n8nWebhookUrl = 'https://n8n.srv655139.hstgr.cloud/webhook/chat';

$payload = [
    'message' => $message,
    'sessionId' => $sessionId,
    'timestamp' => date('c'),
    'attachments' => []
];

// Add audio to attachments
if ($audioData) {
    $payload['attachments'][] = [
        'type' => 'audio',
        'name' => $audioFileName,
        'mimeType' => $audioMimeType,
        'data' => $audioData
    ];
}

// Add file attachment
if ($attachmentData) {
    $payload['attachments'][] = [
        'type' => 'file',
        'name' => $attachmentFileName,
        'mimeType' => $attachmentMimeType,
        'data' => $attachmentData
    ];
}

// If only audio (no text), use a placeholder message
if (empty($message) && $audioData) {
    $payload['message'] = '[Audio message]';
}

$ch = curl_init($n8nWebhookUrl);

curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 60);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);

curl_close($ch);

if ($curlError) {
    echo json_encode([
        'error' => 'Connection error: ' . $curlError,
        'text' => 'Lo siento, hubo un problema de conexión. Por favor intenta de nuevo.'
    ]);
    exit;
}

if ($httpCode !== 200) {
    echo json_encode([
        'error' => 'Webhook error: HTTP ' . $httpCode,
        'text' => 'Lo siento, el servicio no está disponible en este momento.'
    ]);
    exit;
}

$responseData = json_decode($response, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        'text' => $response,
        'rawResponse' => true
    ]);
    exit;
}

// Process response
$output = [
    'text' => $responseData['text'] ?? $responseData['message'] ?? $responseData['output'] ?? 'Mensaje recibido'
];

// If response contains audio data (base64), convert to URL
if (!empty($responseData['audioData'])) {
    $audioDataDecoded = base64_decode($responseData['audioData']);
    $audioFileName = 'response_' . time() . '.mp3';
    $audioPath = __DIR__ . '/audio/' . $audioFileName;
    
    if (!is_dir(__DIR__ . '/audio')) {
        mkdir(__DIR__ . '/audio', 0755, true);
    }
    
    file_put_contents($audioPath, $audioDataDecoded);
    $output['audioUrl'] = 'audio/' . $audioFileName;
}

echo json_encode($output);
