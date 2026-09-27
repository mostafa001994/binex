[CmdletBinding()]
param(
    [switch]$Build
)

$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot
$composePath = Join-Path $projectRoot "compose.portable.yaml"
$envPath = Join-Path $projectRoot ".env.portable"
$projectName = "binix-local-portable"

if (-not (Test-Path -LiteralPath $composePath)) {
    throw "compose.portable.yaml was not found."
}

if (-not (Test-Path -LiteralPath $envPath)) {
    throw ".env.portable was not found. Run scripts\bootstrap-portable.ps1 first."
}

$docker = Get-Command docker -ErrorAction SilentlyContinue
if (-not $docker) {
    throw "Docker CLI was not found. Start or install Docker Desktop."
}

$composeArgs = @(
    "compose",
    "-p", $projectName,
    "-f", $composePath,
    "--env-file", $envPath,
    "up", "-d"
)

if ($Build) {
    $composeArgs += "--build"
}

& $docker.Source @composeArgs
if ($LASTEXITCODE -ne 0) {
    throw "Starting the local Binix environment failed."
}

Write-Host "Binix started with project $projectName and .env.portable."
