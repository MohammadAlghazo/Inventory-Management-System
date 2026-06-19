$dir = 'InventoryManagement.Application\Validators'
Get-ChildItem -Recurse $dir -Filter "*.cs" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $updated = $content -replace "namespace InventoryManagement.Api.Validators", "namespace InventoryManagement.Application.Validators"
    if ($content -ne $updated) {
        Set-Content $_.FullName $updated -NoNewline
    }
}
