$appDir = 'InventoryManagement.Application\Services'

Get-ChildItem -Recurse $appDir -Filter "*.cs" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $updated = $content -replace "using Inventory_Management.*?;", ""
    $updated = $updated -replace "using Microsoft.Extensions.Configuration;", "using Microsoft.Extensions.Configuration;"
    if ($content -ne $updated) {
        Set-Content $_.FullName $updated -NoNewline
    }
}
