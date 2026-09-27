$ErrorActionPreference = "Stop"
$root = (Get-Location).Path
Write-Host "Cleaning obsolete Sales Agent files..."
$p = Join-Path $root "tests\sales-agent-backend.test.mjs"
if (Test-Path $p) { Remove-Item -LiteralPath $p -Force; Write-Host "Deleted: $p" }
$p = Join-Path $root "tests\sales-agent-workflows.test.mjs"
if (Test-Path $p) { Remove-Item -LiteralPath $p -Force; Write-Host "Deleted: $p" }
$p = Join-Path $root "src\components\sales-agent\sales-agent-workflows.tsx"
if (Test-Path $p) { Remove-Item -LiteralPath $p -Force; Write-Host "Deleted: $p" }
$p = Join-Path $root "src\lib\api-client\sales-agent-workflows.ts"
if (Test-Path $p) { Remove-Item -LiteralPath $p -Force; Write-Host "Deleted: $p" }
$p = Join-Path $root "src\app\api\v1\sales-agent\overview\route.ts"
if (Test-Path $p) { Remove-Item -LiteralPath $p -Force; Write-Host "Deleted: $p" }
$p = Join-Path $root "src\app\api\v1\sales-agent\products\route.ts"
if (Test-Path $p) { Remove-Item -LiteralPath $p -Force; Write-Host "Deleted: $p" }
$p = Join-Path $root "src\app\api\v1\sales-agent\products\[productId]\route.ts"
if (Test-Path $p) { Remove-Item -LiteralPath $p -Force; Write-Host "Deleted: $p" }
$p = Join-Path $root "src\app\api\v1\sales-agent\conversations\route.ts"
if (Test-Path $p) { Remove-Item -LiteralPath $p -Force; Write-Host "Deleted: $p" }
$p = Join-Path $root "src\app\api\v1\sales-agent\conversations\[conversationId]\route.ts"
if (Test-Path $p) { Remove-Item -LiteralPath $p -Force; Write-Host "Deleted: $p" }
$p = Join-Path $root "src\app\api\v1\sales-agent\conversations\[conversationId]\messages\route.ts"
if (Test-Path $p) { Remove-Item -LiteralPath $p -Force; Write-Host "Deleted: $p" }
$p = Join-Path $root "src\app\api\v1\sales-agent\orders\route.ts"
if (Test-Path $p) { Remove-Item -LiteralPath $p -Force; Write-Host "Deleted: $p" }
$p = Join-Path $root "src\app\api\v1\sales-agent\orders\[orderId]\route.ts"
if (Test-Path $p) { Remove-Item -LiteralPath $p -Force; Write-Host "Deleted: $p" }
$p = Join-Path $root "src\app\api\v1\sales-agent\settings\route.ts"
if (Test-Path $p) { Remove-Item -LiteralPath $p -Force; Write-Host "Deleted: $p" }
$p = Join-Path $root "src\app\api\v1\sales-agent\bale\connect\route.ts"
if (Test-Path $p) { Remove-Item -LiteralPath $p -Force; Write-Host "Deleted: $p" }
$p = Join-Path $root "src\app\api\v1\sales-agent\bale\disconnect\route.ts"
if (Test-Path $p) { Remove-Item -LiteralPath $p -Force; Write-Host "Deleted: $p" }
$p = Join-Path $root "src\app\api\v1\sales-agent\knowledge\route.ts"
if (Test-Path $p) { Remove-Item -LiteralPath $p -Force; Write-Host "Deleted: $p" }
$p = Join-Path $root "src\app\api\v1\sales-agent\knowledge\[knowledgeId]\route.ts"
if (Test-Path $p) { Remove-Item -LiteralPath $p -Force; Write-Host "Deleted: $p" }

# Remove now-empty directories under sales-agent API tree.
$apiRoot = Join-Path $root "src\app\api\v1\sales-agent"
if (Test-Path $apiRoot) {
  Get-ChildItem -Path $apiRoot -Directory -Recurse |
    Sort-Object FullName -Descending |
    ForEach-Object {
      if (-not (Get-ChildItem -LiteralPath $_.FullName -Force)) {
        Remove-Item -LiteralPath $_.FullName -Force
      }
    }
}

Write-Host ""
Write-Host "Cleanup complete."
Write-Host "Run: npm test"
Write-Host "Then: npm run build"
