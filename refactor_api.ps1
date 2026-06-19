$apiDir = 'Inventory Management'

Get-ChildItem -Recurse $apiDir -Filter "*.cs" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $updated = $content -replace "namespace Inventory_Management.Controllers", "namespace InventoryManagement.Api.Controllers"
    $updated = $updated -replace "namespace Inventory_Management.Middleware", "namespace InventoryManagement.Api.Middleware"
    $updated = $updated -replace "namespace Inventory_Management", "namespace InventoryManagement.Api"
    if ($content -ne $updated) {
        Set-Content $_.FullName $updated -NoNewline
    }
}
