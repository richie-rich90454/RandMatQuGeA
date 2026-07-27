param(
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$scriptRoot = $PSScriptRoot
$testsDir = Join-Path (Join-Path $PSScriptRoot "..") "src" "__tests__"
Set-Location -LiteralPath (Join-Path $PSScriptRoot "..")

# Find all .test.ts files in __tests__ and check for unfixed imports
$testFiles = Get-ChildItem -Path $testsDir -Recurse -Filter "*.test.ts" | ForEach-Object { $_.FullName }

$count = 0
$fixed = 0

foreach ($file in $testFiles) {
    $relative = Resolve-Path -LiteralPath $file -RelativeBasePath (Join-Path $PSScriptRoot "..")
    $relative = $relative -replace '^\.\\', '' -replace '\\', '/'

    # Check if this file has any relative imports
    $content = Get-Content -LiteralPath $file -Raw
    if ($content -match '(?<=(?:from|import)\s*\(?\s*["''])(\.\.?\/[^"'']+)(?=["''])') {
        $count++
        $shortName = Split-Path -Leaf $file

        if (-not $DryRun) {
            # Run the fix script
            $output = & node (Join-Path $scriptRoot "fix-test-imports.mjs") $file 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Error "Fix failed for $relative`: $output"
                exit 1
            }

            # Check if there are actual changes to commit
            & git add -A 2>&1 | Out-Null
            $status = & git status --porcelain
            if ($status) {
                $commitMsg = "fix: adjust relative import paths in $shortName for __tests__ location"
                & git commit -m $commitMsg --quiet 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "[$count] Fixed and committed: $relative" -ForegroundColor Green
                    $fixed++
                } else {
                    Write-Error "  -> Commit failed for $relative"
                    exit 1
                }
            }
            else {
                Write-Host "[$count] No changes needed: $relative" -ForegroundColor Gray
            }
        } else {
            Write-Host "[DRY RUN] Would fix: $relative" -ForegroundColor Yellow
        }
    }
}

if ($DryRun) {
    Write-Host "`nDry run complete. $count files need fixing." -ForegroundColor Yellow
} else {
    Write-Host "`nDone! $fixed files fixed and committed." -ForegroundColor Green
}
