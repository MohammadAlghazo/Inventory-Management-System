$appDir = 'InventoryManagement.Application\Services'

Get-ChildItem -Recurse $appDir -Filter "*.cs" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $updated = $content -replace "private readonly AppDbContext", "private readonly IAppDbContext"
    if ($content -ne $updated) {
        Set-Content $_.FullName $updated -NoNewline
    }
}
