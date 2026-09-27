[CmdletBinding()]
param(
    [ValidatePattern('^09\d{9}$')]
    [string]$AdminPhone,

    [ValidateRange(1, 65535)]
    [int]$WebPort = 4000,

    [ValidateRange(1, 65535)]
    [int]$DatabasePort = 15432,

    [switch]$RecreateEnvironment
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectRoot ".env.portable"
$composePath = Join-Path $projectRoot "compose.portable.yaml"

function Get-DockerExecutable {
    $command = Get-Command docker -ErrorAction SilentlyContinue
    if ($command) {
        return $command.Source
    }

    $desktopCli = Join-Path $env:LOCALAPPDATA "Programs\DockerDesktop\resources\bin\docker.exe"
    if (Test-Path -LiteralPath $desktopCli) {
        return $desktopCli
    }

    throw "Docker CLI پیدا نشد. Docker Desktop را نصب و اجرا کنید."
}

function New-RandomHex([int]$ByteCount) {
    $bytes = New-Object byte[] $ByteCount
    $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($bytes)
        return -join ($bytes | ForEach-Object { $_.ToString("x2") })
    }
    finally {
        $rng.Dispose()
        [Array]::Clear($bytes, 0, $bytes.Length)
    }
}

function New-RandomBase64([int]$ByteCount) {
    $bytes = New-Object byte[] $ByteCount
    $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
    try {
        $rng.GetBytes($bytes)
        return [Convert]::ToBase64String($bytes)
    }
    finally {
        $rng.Dispose()
        [Array]::Clear($bytes, 0, $bytes.Length)
    }
}

$environmentExists = Test-Path -LiteralPath $envPath

if ($environmentExists -and -not $RecreateEnvironment) {
    Write-Host "فایل .env.portable از قبل وجود دارد و دوباره ساخته نشد."
}
else {
    if (-not $AdminPhone) {
        $AdminPhone = Read-Host "شماره موبایل Super Admin، مانند 09123456789"
    }

    if ($AdminPhone -notmatch '^09\d{9}$') {
        throw "شماره موبایل باید به شکل 09xxxxxxxxx باشد."
    }

    if ($environmentExists -and $RecreateEnvironment) {
        $docker = Get-DockerExecutable
        Set-Location -LiteralPath $projectRoot
        & $docker compose -f $composePath --env-file $envPath down --volumes --remove-orphans
        if ($LASTEXITCODE -ne 0) {
            throw "حذف محیط قبلی ناموفق بود؛ فایل تنظیمات بازنویسی نشد."
        }
    }

    $databasePassword = New-RandomHex 32
    $encryptionKey = New-RandomBase64 32
    $environment = @"
BINIX_DB_NAME=binix
BINIX_DB_USER=binix
BINIX_DB_PASSWORD=$databasePassword
BINIX_DB_HOST_PORT=$DatabasePort
BINIX_WEB_PORT=$WebPort
BINIX_SEED_SUPER_ADMIN_PHONE=$AdminPhone
BINIX_CREDENTIALS_ENCRYPTION_KEY=$encryptionKey
BINIX_OTP_DRIVER=mock
BINIX_RUNTIME_ENV=local
BINIX_PAYMENT_TEST_MODE=true
BINIX_LOCAL_REAL_PAYMENT=false
BINIX_SESSION_COOKIE_NAME=binix_session
BINIX_SESSION_TTL_DAYS=30
"@

    $utf8 = New-Object System.Text.UTF8Encoding($false)
    [IO.File]::WriteAllText($envPath, $environment, $utf8)
    $databasePassword = $null
    $encryptionKey = $null
    $environment = $null
    Write-Host "فایل امن .env.portable ساخته شد."
}

$docker = Get-DockerExecutable
Set-Location -LiteralPath $projectRoot

$configuredWebPort = Get-Content -LiteralPath $envPath |
    Where-Object { $_ -like "BINIX_WEB_PORT=*" } |
    Select-Object -First 1

if ($configuredWebPort) {
    $WebPort = [int]$configuredWebPort.Substring("BINIX_WEB_PORT=".Length)
}

& $docker info *> $null
if ($LASTEXITCODE -ne 0) {
    throw "Docker Engine در دسترس نیست. Docker Desktop را اجرا کنید."
}

$composeArgs = @(
    "compose",
    "-f", $composePath,
    "--env-file", $envPath
)

& $docker @composeArgs config --quiet
if ($LASTEXITCODE -ne 0) {
    throw "تنظیمات Docker Compose معتبر نیست."
}

Write-Host "ساخت image و راه‌اندازی PostgreSQL، migration و Binix آغاز شد..."
& $docker @composeArgs up -d --build
if ($LASTEXITCODE -ne 0) {
    & $docker @composeArgs logs --tail 200
    throw "راه‌اندازی Docker ناموفق بود."
}

$healthUrl = "http://127.0.0.1:$WebPort/api/v1/health"
$healthy = $false

for ($attempt = 1; $attempt -le 60; $attempt++) {
    try {
        $health = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 5
        if ($health.success -and $health.data.status -eq "ok" -and $health.data.dataDriver -eq "database") {
            $healthy = $true
            break
        }
    }
    catch {
        # The services may still be starting; the final failure prints their logs.
    }

    if (-not $healthy) {
        Start-Sleep -Seconds 2
    }
}

if (-not $healthy) {
    & $docker @composeArgs ps
    & $docker @composeArgs logs --tail 200 web migrate database
    throw "Binix در زمان مورد انتظار سالم نشد. لاگ‌ها در خروجی بالا نمایش داده شدند."
}

& $docker @composeArgs ps
Write-Host ""
Write-Host "Binix با PostgreSQL آماده است: http://127.0.0.1:$WebPort"
Write-Host "کد OTP توسعه محلی: 12345"
Write-Host "فایل .env.portable محرمانه است و نباید ارسال یا commit شود."
