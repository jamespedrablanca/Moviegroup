<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(int $status, array $body): void
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

function startCinemateSession(): void
{
    $isHttps = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    session_name('cinemate_session');
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

$method = $_SERVER['REQUEST_METHOD'] ?? '';
$action = $_GET['action'] ?? '';

if ($method === 'GET' && $action === 'session') {
    startCinemateSession();
    respond(200, ['user' => $_SESSION['user'] ?? null]);
}

if ($method === 'POST' && $action === 'logout') {
    startCinemateSession();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $cookie = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires' => time() - 42000,
            'path' => $cookie['path'],
            'domain' => $cookie['domain'],
            'secure' => $cookie['secure'],
            'httponly' => $cookie['httponly'],
            'samesite' => 'Lax',
        ]);
    }
    session_destroy();
    respond(200, ['message' => 'Signed out.']);
}

if ($method !== 'POST' || !in_array($action, ['register', 'login'], true)) {
    header('Allow: GET, POST');
    respond(405, ['error' => 'Unsupported account request.']);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    respond(400, ['error' => 'Enter valid account details and try again.']);
}

$email = strtolower(trim((string)($input['email'] ?? '')));
$password = (string)($input['password'] ?? '');

if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 190) {
    respond(422, ['error' => 'Enter a valid email address.']);
}

try {
    require __DIR__ . '/config.php';

    if ($action === 'register') {
        $name = trim((string)($input['name'] ?? ''));
        $nameLength = preg_match_all('/./us', $name, $nameCharacters);
        if ($name === '' || $nameLength === false || $nameLength > 100) {
            respond(422, ['error' => 'Enter your name (up to 100 characters).']);
        }
        if (strlen($password) < 8 || strlen($password) > 72) {
            respond(422, ['error' => 'Choose a password between 8 and 72 characters.']);
        }

        $statement = $pdo->prepare(
            'INSERT INTO accounts (full_name, email, password_hash) VALUES (:name, :email, :password_hash)'
        );
        try {
            $statement->execute([
                'name' => $name,
                'email' => $email,
                'password_hash' => password_hash($password, PASSWORD_DEFAULT),
            ]);
        } catch (PDOException $error) {
            if ($error->getCode() === '23000') {
                respond(409, ['error' => 'An account with that email already exists. Please sign in.']);
            }
            throw $error;
        }

        respond(201, ['message' => 'Account created. Sign in to continue.']);
    }

    $statement = $pdo->prepare(
        'SELECT id, full_name, email, password_hash FROM accounts WHERE email = :email LIMIT 1'
    );
    $statement->execute(['email' => $email]);
    $account = $statement->fetch();

    if (!$account || !password_verify($password, $account['password_hash'])) {
        respond(401, ['error' => 'Incorrect email or password.']);
    }

    startCinemateSession();
    session_regenerate_id(true);
    $_SESSION['user'] = [
        'id' => (int)$account['id'],
        'name' => $account['full_name'],
        'email' => $account['email'],
    ];

    respond(200, ['user' => $_SESSION['user']]);
} catch (Throwable $error) {
    error_log('Cinemate account API error: ' . $error->getMessage());
    respond(503, ['error' => 'The account database is unavailable. Start MySQL and import api/database.sql.']);
}
