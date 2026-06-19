$appDir = 'InventoryManagement.Application\Services'

Get-ChildItem -Recurse $appDir -Filter "*.cs" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $className = $_.BaseName
    $updated = $content -replace "public \(IAppDbContext", "public $className(IAppDbContext"
    if ($content -ne $updated) {
        Set-Content $_.FullName $updated -NoNewline
    }
}
