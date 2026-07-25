$root = "C:\Users\rjian\Desktop\RandMatQuGeA"
Set-Location $root

$skipRel = @(
    "src/script.ts", "src/script.test.ts", "src/vitest.setup.ts",
    "src/types/global.d.ts"
)

function Should-Skip($rp) {
    if ($rp -in $skipRel) { return $true }
    $n = Split-Path $rp -Leaf
    if ($n -eq "index.ts" -or $n -eq "index.test.ts") { return $true }
    return $false
}

function Get-PascalName($n) {
    $parts = $n -split '-'
    $result = $parts | ForEach-Object { if ($_.Length -gt 0) { $_.Substring(0,1).ToUpper() + $_.Substring(1) } }
    return ($result -join '')
}

$filesToRename = @()
Get-ChildItem -Path src -Recurse -Filter "*.ts" | ForEach-Object {
    $rel = $_.FullName.Substring($root.Length + 1) -replace '\\', '/'
    if (Should-Skip $rel) { return }
    $fn = $_.Name
    if ($fn -match '^(.+)\.test\.ts$') { $base = $Matches[1]; $suf = ".test.ts" }
    elseif ($fn -match '^(.+)\.d\.ts$') { $base = $Matches[1]; $suf = ".d.ts" }
    else { $base = $fn -replace '\.ts$', ''; $suf = ".ts" }
    $pascal = Get-PascalName $base; $newFn = $pascal + $suf
    if ($fn -ceq $newFn) { return }
    $filesToRename += @{ Full = $_.FullName; Dir = $_.Directory.FullName; Old = $fn; New = $newFn; OldBase = $base; NewBase = $pascal }
}

Write-Host "Files to rename: $($filesToRename.Count)"
$count = 0
$errors = @()

foreach ($f in $filesToRename) {
    $count++
    Write-Host "[$count/$($filesToRename.Count)] $($f.Old) -> $($f.New)"

    # git mv via temp name (Windows case-insensitive FS workaround)
    $tmp = Join-Path $f.Dir "_tmp_$($f.Old)"
    $newPath = Join-Path $f.Dir $f.New
    git mv $f.Full $tmp 2>&1 | Out-Null
    git mv $tmp $newPath 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  FAIL git mv"; $errors += $f.Old; continue
    }

    # Commit rename
    git add -A 2>&1 | Out-Null
    git commit -m "Rename $($f.Old) to $($f.New)" 2>&1 | Out-Null

    # Update imports across all .ts files
    $escaped = [regex]::Escape($f.OldBase)
    foreach ($if in (Get-ChildItem -Path src -Recurse -Filter "*.ts")) {
        $c = Get-Content $if.FullName -Raw -ErrorAction SilentlyContinue
        if (-not $c) { continue }
        $r1 = $c -replace "(from\s+['""][^'""]*/)$escaped((\.js)?['""])", "`$1$($f.NewBase)`$2"
        $r2 = $r1 -replace "(import\s+['""][^'""]*/)$escaped((\.js)?['""])", "`$1$($f.NewBase)`$2"
        if ($r2 -ne $c) { Set-Content $if.FullName $r2 -NoNewline }
    }

    # Commit import updates
    git add -A 2>&1 | Out-Null
    git commit -m "Update imports for $($f.New) rename" 2>&1 | Out-Null

    Write-Host "  OK"
}

if ($errors.Count -gt 0) { Write-Host "ERRORS: $($errors -join ', ')" }
Write-Host "=== ALL RENAMES COMPLETE ==="
