$root = "C:\Users\rjian\Desktop\RandMatQuGeA"
Set-Location $root
$utf8 = [System.Text.Encoding]::UTF8

$renames = @()
git log --oneline --format="%s" | Where-Object { $_ -match "^Rename (.+) to (.+)$" -and $_ -notmatch "\(test\)" } | ForEach-Object {
    $renames += @{ OldBase = $Matches[1] -replace '\.test\.ts$', '' -replace '\.ts$', ''; NewBase = $Matches[2] -replace '\.test\.ts$', '' -replace '\.ts$', '' }
}

Write-Host "Files to update imports for: $($renames.Count)"
$totalChanges = 0

foreach ($r in $renames) {
    $escaped = [regex]::Escape($r.OldBase)
    foreach ($if in (Get-ChildItem -Path src -Recurse -Filter "*.ts")) {
        $c = [System.IO.File]::ReadAllText($if.FullName, $utf8)
        $r1 = $c -replace "(from\s*['""][^'""]*/)$escaped((\.js)?['""])", "`$1$($r.NewBase)`$2"
        $r2 = $r1 -replace "(import\s*['""][^'""]*/)$escaped((\.js)?['""])", "`$1$($r.NewBase)`$2"
        $r3 = $r2 -replace "(import\(\s*['""][^'""]*/)$escaped((\.js)?['""]\s*\))", "`$1$($r.NewBase)`$2"
        if ($r3 -cne $c) { [System.IO.File]::WriteAllText($if.FullName, $r3, $utf8); $totalChanges++ }
    }
}

Write-Host "Files modified: $totalChanges"
git add -A
git commit -m "Fix all imports to match renamed PascalCase files"
