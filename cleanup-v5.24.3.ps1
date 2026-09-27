$ErrorActionPreference = "Stop"
$root = (Get-Location).Path
Write-Host "Deep cleaning obsolete Sales Agent routes..."

# Remove obsolete API directories recursively. [brackets] in dynamic routes are handled safely by -LiteralPath.
$p = Join-Path $root "src\app\api\v1\sales-agent\overview"
if (Test-Path -LiteralPath $p) {
  Remove-Item -LiteralPath $p -Recurse -Force
  Write-Host "Deleted directory: $p"
}
$p = Join-Path $root "src\app\api\v1\sales-agent\products"
if (Test-Path -LiteralPath $p) {
  Remove-Item -LiteralPath $p -Recurse -Force
  Write-Host "Deleted directory: $p"
}
$p = Join-Path $root "src\app\api\v1\sales-agent\conversations"
if (Test-Path -LiteralPath $p) {
  Remove-Item -LiteralPath $p -Recurse -Force
  Write-Host "Deleted directory: $p"
}
$p = Join-Path $root "src\app\api\v1\sales-agent\orders"
if (Test-Path -LiteralPath $p) {
  Remove-Item -LiteralPath $p -Recurse -Force
  Write-Host "Deleted directory: $p"
}
$p = Join-Path $root "src\app\api\v1\sales-agent\settings"
if (Test-Path -LiteralPath $p) {
  Remove-Item -LiteralPath $p -Recurse -Force
  Write-Host "Deleted directory: $p"
}
$p = Join-Path $root "src\app\api\v1\sales-agent\bale"
if (Test-Path -LiteralPath $p) {
  Remove-Item -LiteralPath $p -Recurse -Force
  Write-Host "Deleted directory: $p"
}
$p = Join-Path $root "src\app\api\v1\sales-agent\knowledge"
if (Test-Path -LiteralPath $p) {
  Remove-Item -LiteralPath $p -Recurse -Force
  Write-Host "Deleted directory: $p"
}

# Remove obsolete files/tests.
$p = Join-Path $root "tests\sales-agent-backend.test.mjs"
if (Test-Path -LiteralPath $p) {
  Remove-Item -LiteralPath $p -Force
  Write-Host "Deleted file: $p"
}
$p = Join-Path $root "tests\sales-agent-workflows.test.mjs"
if (Test-Path -LiteralPath $p) {
  Remove-Item -LiteralPath $p -Force
  Write-Host "Deleted file: $p"
}
$p = Join-Path $root "src\components\sales-agent\sales-agent-workflows.tsx"
if (Test-Path -LiteralPath $p) {
  Remove-Item -LiteralPath $p -Force
  Write-Host "Deleted file: $p"
}
$p = Join-Path $root "src\lib\api-client\sales-agent-workflows.ts"
if (Test-Path -LiteralPath $p) {
  Remove-Item -LiteralPath $p -Force
  Write-Host "Deleted file: $p"
}

$credentials = Join-Path $root "src\app\api\v1\sales-agent\credentials\route.ts"
if (-not (Test-Path -LiteralPath $credentials)) {
  throw "credentials route is missing: $credentials"
}

Write-Host ""
Write-Host "Sales Agent API cleanup complete."
Write-Host "Only credentials route should remain."
Write-Host "Run: npm test"
Write-Host "Then: npm run build"
