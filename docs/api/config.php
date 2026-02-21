<?php
// Configuração do Banco de Dados
// Substitua com suas credenciais
define('DB_HOST', 'localhost');
define('DB_NAME', 'd3f4ltco_newsletter_devlab');
define('DB_USER', 'd3f4ltco_newsletter_devlab');
define('DB_PASS', 'zEaq25SKp7AqTADkMAdN');

// Conexão PDO
function getConnection() {
    try {
        $pdo = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Erro de conexão']);
        exit;
    }
}
