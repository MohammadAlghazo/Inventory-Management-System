param (
    [string]$OutputDir = ".\_CodeExports"
)

# إنشاء مجلد المخرجات إذا لم يكن موجوداً
if (-not (Test-Path -Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$FrontendOutputFile = Join-Path $OutputDir "frontend_code_$Timestamp.md"
$BackendOutputFile = Join-Path $OutputDir "backend_code_$Timestamp.md"

# المجلدات المسموح بها لكل قسم
$FrontendFolders = @("inventory-frontend")
$BackendFolders = @(
    "Inventory Management", 
    "InventoryManagement.Application", 
    "InventoryManagement.Domain", 
    "InventoryManagement.Infrastructure"
)

# المجلدات والملفات التي يجب تجاهلها (لتقليل حجم الملف واستبعاد الملفات غير المهمة)
$ExcludedDirs = @("node_modules", "dist", "bin", "obj", ".git", ".vs", ".angular", "logs", ".agents", "scratch")
$ExcludedFiles = @("package-lock.json", "yarn.lock", "*.pdf", "*.jpg", "*.png", "*.ico", "*.svg", "*.dll", "*.exe", "*.pdb")

function Export-CodeToMarkdown {
    param (
        [string[]]$FoldersToScan,
        [string]$OutputFile
    )

    Write-Host "Exporting to $OutputFile ..." -ForegroundColor Cyan
    
    # تفريغ أو إنشاء الملف
    Set-Content -Path $OutputFile -Value "# Code Export - $(Get-Date)`n"

    foreach ($folder in $FoldersToScan) {
        if (-not (Test-Path $folder)) {
            continue
        }

        # جلب جميع الملفات وتصفيتها
        $files = Get-ChildItem -Path $folder -Recurse -File | Where-Object {
            $file = $_
            $isExcludedDir = $false
            
            # التحقق مما إذا كان الملف داخل مجلد مستبعد
            foreach ($exDir in $ExcludedDirs) {
                if ($file.DirectoryName -match "\\$exDir(\\|$)") {
                    $isExcludedDir = $true
                    break
                }
            }

            # التحقق من نوع أو اسم الملف المستبعد
            $isExcludedFile = $false
            foreach ($exFile in $ExcludedFiles) {
                if ($exFile.StartsWith("*") -and $file.Extension -eq $exFile.Substring(1)) {
                    $isExcludedFile = $true
                    break
                } elseif ($file.Name -eq $exFile) {
                    $isExcludedFile = $true
                    break
                }
            }

            return (-not $isExcludedDir) -and (-not $isExcludedFile)
        }

        # كتابة محتوى كل ملف داخل ملف المخرجات بصيغة Markdown
        foreach ($file in $files) {
            # الحصول على المسار النسبي
            $relativePath = Resolve-Path -Path $file.FullName -Relative

            # تحديد لغة الكود بناءً على الامتداد
            $lang = "plaintext"
            switch ($file.Extension.ToLower()) {
                ".ts"   { $lang = "typescript" }
                ".js"   { $lang = "javascript" }
                ".html" { $lang = "html" }
                ".css"  { $lang = "css" }
                ".scss" { $lang = "scss" }
                ".json" { $lang = "json" }
                ".cs"   { $lang = "csharp" }
                ".md"   { $lang = "markdown" }
            }

            # تجاهل ملفات JSON الخاصة باللغات (اختياري)
            if ($file.Name -match "^(ar|en)\.json$") {
                continue
            }

            try {
                $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
                
                # إضافة محتوى الملف للملف النهائي
                $block = "## File: $($relativePath)`n``````$lang`n$content`n```````n`n"
                Add-Content -Path $OutputFile -Value $block
            }
            catch {
                Write-Warning "Could not read file: $($file.FullName)"
            }
        }
    }
    
    Write-Host "Successfully generated: $OutputFile" -ForegroundColor Green
}

# تشغيل التصدير للـ Frontend
Export-CodeToMarkdown -FoldersToScan $FrontendFolders -OutputFile $FrontendOutputFile

# تشغيل التصدير للـ Backend
Export-CodeToMarkdown -FoldersToScan $BackendFolders -OutputFile $BackendOutputFile

Write-Host "All exports completed successfully!" -ForegroundColor Yellow
