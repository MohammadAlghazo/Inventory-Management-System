# ============================================================
#  StockMaster — AI Codebase Exporter
#  يولّد ملفين .md جاهزين للإرسال لأي AI
#  frontend_codebase.md  +  backend_codebase.md
# ============================================================

$ROOT         = "d:\Projects\Inventory Management\Inventory-Management"
$FRONTEND_SRC = "$ROOT\inventory-frontend\src"
$BACKEND_ROOT = "$ROOT"
$OUTPUT_DIR   = "$ROOT"
$MAX_LINES    = 300   # الملفات الكبيرة جداً تُقطع عند هذا الحد

# ─── ألوان للـ Terminal ─────────────────────────────────────
function Write-Header($text) { Write-Host "`n  $text" -ForegroundColor Cyan }
function Write-OK($text)     { Write-Host "  [+] $text" -ForegroundColor Green }
function Write-Info($text)   { Write-Host "  $text" -ForegroundColor Yellow }

# ─── مساعد: قراءة ملف مع اقتصار على MAX_LINES ──────────────
function Get-FileContent($path) {
    $lines = Get-Content $path -ErrorAction SilentlyContinue
    if ($null -eq $lines) { return "*(empty file)*" }
    if ($lines.Count -le $MAX_LINES) { return $lines -join "`n" }
    $trunc = $lines[0..($MAX_LINES - 1)] -join "`n"
    return "$trunc`n`n> [!WARNING]`n> File truncated — $($lines.Count) total lines, showing first $MAX_LINES"
}

# ─── مساعد: تحديد لغة الكود لـ Markdown ────────────────────
function Get-Lang($ext) {
    switch ($ext) {
        ".ts"   { "typescript" }
        ".html" { "html" }
        ".css"  { "css" }
        ".cs"   { "csharp" }
        ".json" { "json" }
        default { "" }
    }
}

# ════════════════════════════════════════════════════════════
#  FRONTEND EXPORT
# ════════════════════════════════════════════════════════════
Write-Header "FRONTEND — Scanning Angular project..."

$FE_EXCLUDE_DIRS = @("node_modules","dist",".angular",".vite",".git","i18n",".vscode","public")
$FE_INCLUDE_EXTS = @(".ts",".html",".css")

$feFiles = Get-ChildItem -Path $FRONTEND_SRC -Recurse -File | Where-Object {
    $rel = $_.FullName.Replace("$FRONTEND_SRC\", "")
    $skip = $false
    foreach ($d in $FE_EXCLUDE_DIRS) { if ($rel -like "*\$d\*" -or $rel -like "$d\*") { $skip=$true; break } }
    if ($skip)                              { return $false }
    if ($_.Extension -notin $FE_INCLUDE_EXTS) { return $false }
    if ($_.Name -like "*.spec.*")          { return $false }
    # تخطي styles.css (كبير ويحتوي على utility classes فقط)
    if ($_.Name -eq "styles.css" -and $rel -notlike "*app\*") { return $false }
    return $true
} | Sort-Object FullName

# شجرة المشروع
$lines = @("``````","inventory-frontend/src/")
foreach ($f in $feFiles) { $lines += "  " + $f.FullName.Replace("$FRONTEND_SRC\","").Replace("\","/") }
$lines += "``````"
$tree = $lines -join "`n"

# بناء Markdown
$md = [System.Text.StringBuilder]::new()
[void]$md.AppendLine("# StockMaster — Frontend Codebase")
[void]$md.AppendLine("")
[void]$md.AppendLine("> **Generated:** $(Get-Date -Format 'yyyy-MM-dd HH:mm')  ")
[void]$md.AppendLine("> **Framework:** Angular 18 (Standalone Components)  ")
[void]$md.AppendLine("> **Stack:** Angular + Bootstrap 5 + ngx-translate + Lucide Icons + ng2-charts  ")
[void]$md.AppendLine("")
[void]$md.AppendLine("---")
[void]$md.AppendLine("")
[void]$md.AppendLine("## Project Structure")
[void]$md.AppendLine("")
[void]$md.AppendLine($tree)
[void]$md.AppendLine("")
[void]$md.AppendLine("---")
[void]$md.AppendLine("")

$groupDir = ""; $feCount = 0
foreach ($f in $feFiles) {
    $rel  = $f.FullName.Replace("$FRONTEND_SRC\","").Replace("\","/")
    $dir  = ($rel -split "/")[0..($rel.Split("/").Count - 2)] -join "/"
    $lang = Get-Lang $f.Extension

    if ($dir -ne $groupDir) {
        $groupDir = $dir
        $title = if ($dir -eq "") { "Root" } else { $dir }
        [void]$md.AppendLine("## 📁 $title")
        [void]$md.AppendLine("")
    }

    [void]$md.AppendLine("### ``$($f.Name)``")
    [void]$md.AppendLine("")
    [void]$md.AppendLine("``````$lang")
    [void]$md.AppendLine((Get-FileContent $f.FullName))
    [void]$md.AppendLine("``````")
    [void]$md.AppendLine("")
    [void]$md.AppendLine("---")
    [void]$md.AppendLine("")

    $feCount++
    Write-OK "FE: $rel"
}

$fePath = "$OUTPUT_DIR\frontend_codebase.md"
[System.IO.File]::WriteAllText($fePath, $md.ToString(), [System.Text.Encoding]::UTF8)
$feKB = [math]::Round((Get-Item $fePath).Length / 1KB, 1)
Write-Info "Frontend: $feCount files → $feKB KB"

# ════════════════════════════════════════════════════════════
#  BACKEND EXPORT
# ════════════════════════════════════════════════════════════
Write-Header "BACKEND — Scanning .NET solution..."

$BE_LAYERS = [ordered]@{
    "API Layer (Controllers + Program)"   = "$BACKEND_ROOT\Inventory Management"
    "Application Layer (Services + DTOs)" = "$BACKEND_ROOT\InventoryManagement.Application"
    "Domain Layer (Entities + Interfaces)"= "$BACKEND_ROOT\InventoryManagement.Domain"
    "Infrastructure Layer (DbContext)"    = "$BACKEND_ROOT\InventoryManagement.Infrastructure"
}
$BE_EXCLUDE_DIRS = @("bin","obj","Migrations","Logs",".vs",".git","Properties")

$beMd = [System.Text.StringBuilder]::new()
[void]$beMd.AppendLine("# StockMaster — Backend Codebase")
[void]$beMd.AppendLine("")
[void]$beMd.AppendLine("> **Generated:** $(Get-Date -Format 'yyyy-MM-dd HH:mm')  ")
[void]$beMd.AppendLine("> **Framework:** ASP.NET Core 8 Web API  ")
[void]$beMd.AppendLine("> **Architecture:** Clean Architecture  ")
[void]$beMd.AppendLine("> **ORM:** Entity Framework Core + SQL Server  ")
[void]$beMd.AppendLine("> **Auth:** JWT Bearer Tokens  ")
[void]$beMd.AppendLine("")
[void]$beMd.AppendLine("---")
[void]$beMd.AppendLine("")
[void]$beMd.AppendLine("## Solution Architecture")
[void]$beMd.AppendLine("")
[void]$beMd.AppendLine("``````")
[void]$beMd.AppendLine("InventoryManagement.sln")
[void]$beMd.AppendLine("├── Inventory Management/            ← API (Controllers, Middleware, Program.cs)")
[void]$beMd.AppendLine("├── InventoryManagement.Application/ ← Services, DTOs, Validators, Interfaces")
[void]$beMd.AppendLine("├── InventoryManagement.Domain/      ← Entities, Enums, Domain Interfaces")
[void]$beMd.AppendLine("└── InventoryManagement.Infrastructure/ ← DbContext, EF Config, Repositories")
[void]$beMd.AppendLine("``````")
[void]$beMd.AppendLine("")
[void]$beMd.AppendLine("---")
[void]$beMd.AppendLine("")

$beCount = 0
foreach ($layerName in $BE_LAYERS.Keys) {
    $layerPath = $BE_LAYERS[$layerName]
    if (-not (Test-Path $layerPath)) { continue }

    $csFiles = Get-ChildItem -Path $layerPath -Recurse -File -Filter "*.cs" | Where-Object {
        $rel  = $_.FullName.Replace("$layerPath\","")
        $skip = $false
        foreach ($d in $BE_EXCLUDE_DIRS) { if ($rel -like "*\$d\*" -or $rel -like "$d\*") { $skip=$true; break } }
        if ($skip)              { return $false }
        if ($_.Name -eq "Class1.cs") { return $false }
        return $true
    } | Sort-Object FullName

    if ($csFiles.Count -eq 0) { continue }

    [void]$beMd.AppendLine("## 🏗️ $layerName")
    [void]$beMd.AppendLine("")

    $grp = ""
    foreach ($f in $csFiles) {
        $rel = $f.FullName.Replace("$layerPath\","").Replace("\","/")
        $dir = ($rel -split "/")[0..($rel.Split("/").Count - 2)] -join "/"

        if ($dir -ne $grp) {
            $grp = $dir
            if ($dir -ne "") { [void]$beMd.AppendLine("### 📁 $dir"); [void]$beMd.AppendLine("") }
        }

        [void]$beMd.AppendLine("#### ``$($f.Name)``")
        [void]$beMd.AppendLine("")
        [void]$beMd.AppendLine("``````csharp")
        [void]$beMd.AppendLine((Get-FileContent $f.FullName))
        [void]$beMd.AppendLine("``````")
        [void]$beMd.AppendLine("")
        [void]$beMd.AppendLine("---")
        [void]$beMd.AppendLine("")

        $beCount++
        Write-OK "BE: $($f.FullName.Replace($BACKEND_ROOT+'\','').Replace('\','/'))"
    }
}

# Program.cs وappsettings.json (بدون connection strings)
$progFile = "$BACKEND_ROOT\Inventory Management\Program.cs"
if (Test-Path $progFile) {
    [void]$beMd.AppendLine("## ⚙️ Entry Point")
    [void]$beMd.AppendLine("")
    [void]$beMd.AppendLine("#### ``Program.cs``")
    [void]$beMd.AppendLine("")
    [void]$beMd.AppendLine("``````csharp")
    [void]$beMd.AppendLine((Get-FileContent $progFile))
    [void]$beMd.AppendLine("``````")
    [void]$beMd.AppendLine("")
    [void]$beMd.AppendLine("---")
    [void]$beMd.AppendLine("")
    $beCount++
    Write-OK "BE: Program.cs"
}

$settingsFile = "$BACKEND_ROOT\Inventory Management\appsettings.json"
if (Test-Path $settingsFile) {
    $settingsContent = (Get-Content $settingsFile -Raw) `
        -replace '(?i)"Password"\s*:\s*"[^"]*"', '"Password": "***"' `
        -replace '(?i)"ConnectionStrings"[\s\S]*?\{[\s\S]*?\}', '"ConnectionStrings": { "***REDACTED***" }'
    [void]$beMd.AppendLine("## ⚙️ Configuration (sanitized)")
    [void]$beMd.AppendLine("")
    [void]$beMd.AppendLine("``````json")
    [void]$beMd.AppendLine($settingsContent)
    [void]$beMd.AppendLine("``````")
    [void]$beMd.AppendLine("")
    Write-OK "BE: appsettings.json (sanitized)"
}

$bePath = "$OUTPUT_DIR\backend_codebase.md"
[System.IO.File]::WriteAllText($bePath, $beMd.ToString(), [System.Text.Encoding]::UTF8)
$beKB = [math]::Round((Get-Item $bePath).Length / 1KB, 1)
Write-Info "Backend: $beCount files → $beKB KB"

# ════════════════════════════════════════════════════════════
#  SUMMARY
# ════════════════════════════════════════════════════════════
Write-Host ""
Write-Host "  ╔════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "  ║        EXPORT COMPLETE ✓                   ║" -ForegroundColor Magenta
Write-Host "  ╠════════════════════════════════════════════╣" -ForegroundColor Magenta
Write-Host "  ║  📄 frontend_codebase.md  → $feKB KB ($feCount files)" -ForegroundColor White
Write-Host "  ║  📄 backend_codebase.md   → $beKB KB ($beCount files)" -ForegroundColor White
Write-Host "  ║                                            ║" -ForegroundColor Magenta
Write-Host "  ║  📂 $OUTPUT_DIR" -ForegroundColor White
Write-Host "  ╚════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""
