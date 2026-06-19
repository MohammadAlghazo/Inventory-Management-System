$domainDir = 'InventoryManagement.Domain'
$appDir = 'InventoryManagement.Application'
$infraDir = 'InventoryManagement.Infrastructure'

function Replace-Namespace ($dir, $old, $new) {
    Get-ChildItem -Recurse $dir -Filter "*.cs" | ForEach-Object {
        $content = Get-Content $_.FullName -Raw
        $updated = $content -replace [regex]::Escape($old), $new
        if ($content -ne $updated) {
            Set-Content $_.FullName $updated -NoNewline
        }
    }
}

Replace-Namespace "$domainDir\Entities" "namespace Inventory_Management.Models" "namespace InventoryManagement.Domain.Entities"
Replace-Namespace "$domainDir\Common" "namespace Inventory_Management.Common" "namespace InventoryManagement.Domain.Common"
Replace-Namespace "$appDir\Dtos" "namespace Inventory_Management.Dtos" "namespace InventoryManagement.Application.Dtos"
Replace-Namespace "$appDir\Services" "namespace Inventory_Management.Services" "namespace InventoryManagement.Application.Services"
Replace-Namespace "$infraDir\Data" "namespace Inventory_Management._DbContext" "namespace InventoryManagement.Infrastructure.Data"
Replace-Namespace "$infraDir\Migrations" "namespace Inventory_Management.Migrations" "namespace InventoryManagement.Infrastructure.Migrations"
Replace-Namespace "$infraDir\Services" "namespace Inventory_Management.Services" "namespace InventoryManagement.Infrastructure.Services"

$allDirs = @("Inventory Management", "InventoryManagement.Domain", "InventoryManagement.Application", "InventoryManagement.Infrastructure")

foreach ($dir in $allDirs) {
    Get-ChildItem -Recurse $dir -Filter "*.cs" | ForEach-Object {
        $content = Get-Content $_.FullName -Raw
        $updated = $content -replace "using Inventory_Management\.Models;", "using InventoryManagement.Domain.Entities;"
        $updated = $updated -replace "using Inventory_Management\.Models", "using InventoryManagement.Domain.Entities"
        $updated = $updated -replace "using Inventory_Management\.Common;", "using InventoryManagement.Domain.Common;"
        $updated = $updated -replace "using Inventory_Management\.Dtos", "using InventoryManagement.Application.Dtos"
        $updated = $updated -replace "using Inventory_Management\.Services;", "using InventoryManagement.Application.Services;"
        $updated = $updated -replace "using Inventory_Management\._DbContext;", "using InventoryManagement.Infrastructure.Data;"
        if ($content -ne $updated) {
            Set-Content $_.FullName $updated -NoNewline
        }
    }
}
