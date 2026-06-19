$appDir = 'InventoryManagement.Application\Services'

Get-ChildItem -Recurse $appDir -Filter "*.cs" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "_db\.AddNotification") {
        if ($content -notmatch "using InventoryManagement\.Application\.Extensions;") {
            $content = "using InventoryManagement.Application.Extensions;
" + $content
            Set-Content $_.FullName $content -NoNewline
        }
    }
}
