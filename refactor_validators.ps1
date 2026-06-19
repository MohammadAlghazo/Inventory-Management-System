$dir = 'InventoryManagement.Application\Validators'
Get-ChildItem -Recurse $dir -Filter "*.cs" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $updated = $content -replace "namespace Inventory_Management.Validators", "namespace InventoryManagement.Application.Validators"
    $updated = $updated -replace "using Inventory_Management.Dtos;", "using InventoryManagement.Application.Dtos;"
    if ($content -ne $updated) {
        Set-Content $_.FullName $updated -NoNewline
    }
}
