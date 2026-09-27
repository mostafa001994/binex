[CmdletBinding()]
param(
    [string]$OutputDirectory
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot

if (-not $OutputDirectory) {
    $OutputDirectory = Split-Path -Parent $projectRoot
}

$resolvedOutput = [IO.Path]::GetFullPath($OutputDirectory)
[IO.Directory]::CreateDirectory($resolvedOutput) | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$archivePath = Join-Path $resolvedOutput "binix-portable-$timestamp.zip"
$temporaryRoot = Join-Path ([IO.Path]::GetTempPath()) ("binix-portable-" + [guid]::NewGuid().ToString("N"))
$stagingRoot = Join-Path $temporaryRoot "BINIX"

$excludedDirectories = @(
    ".git",
    ".next",
    ".binix",
    "node_modules",
    "src\generated",
    "data"
)

function Test-ExcludedPath([string]$RelativePath) {
    foreach ($directory in $excludedDirectories) {
        if ($RelativePath -eq $directory -or $RelativePath.StartsWith("$directory\", [StringComparison]::OrdinalIgnoreCase)) {
            return $true
        }
    }

    $name = Split-Path -Leaf $RelativePath
    if ($name -eq "tsconfig.tsbuildinfo" -or $name.EndsWith(".log", [StringComparison]::OrdinalIgnoreCase)) {
        return $true
    }

    if ($name.StartsWith(".env", [StringComparison]::OrdinalIgnoreCase) -and $name -ne ".env.portable.example") {
        return $true
    }

    if ($name -like "binix-portable-*.zip") {
        return $true
    }

    return $false
}

function Copy-PortableTree(
    [string]$SourceDirectory,
    [string]$DestinationDirectory
) {
    foreach ($item in Get-ChildItem -LiteralPath $SourceDirectory) {
        $relativePath = [IO.Path]::GetRelativePath($projectRoot, $item.FullName)
        if (Test-ExcludedPath $relativePath) {
            continue
        }

        if ($item.PSIsContainer) {
            if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) {
                continue
            }

            $childDestination = Join-Path $DestinationDirectory $item.Name
            [IO.Directory]::CreateDirectory($childDestination) | Out-Null
            Copy-PortableTree $item.FullName $childDestination
            continue
        }

        Copy-Item -LiteralPath $item.FullName -Destination (Join-Path $DestinationDirectory $item.Name)
    }
}

try {
    [IO.Directory]::CreateDirectory($stagingRoot) | Out-Null

    Copy-PortableTree $projectRoot $stagingRoot

    Compress-Archive -LiteralPath $stagingRoot -DestinationPath $archivePath -CompressionLevel Optimal
}
finally {
    if (Test-Path -LiteralPath $temporaryRoot) {
        Remove-Item -LiteralPath $temporaryRoot -Recurse -Force
    }
}

$archive = Get-Item -LiteralPath $archivePath
Write-Host "پکیج قابل‌ارسال ساخته شد: $($archive.FullName)"
Write-Host "حجم: $([math]::Round($archive.Length / 1MB, 2)) MB"
Write-Host "فایل‌های env واقعی، دیتای محلی، node_modules و build artifacts داخل پکیج نیستند."
