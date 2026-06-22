$controllersDir = "Inventory Management/Controllers"
$files = Get-ChildItem -Path $controllersDir -Filter *.cs -Recurse

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Needs to add using InventoryManagement.Domain.Constants; if not present
    if ($content -match "\[Authorize\(Roles") {
        if (-not ($content -match "using InventoryManagement.Domain.Constants;")) {
            $content = $content -replace "using Microsoft.AspNetCore.Authorization;", "using Microsoft.AspNetCore.Authorization;`r`nusing InventoryManagement.Domain.Constants;"
        }
        
        $content = $content.Replace('[Authorize(Roles = "SuperAdmin")]', '[Authorize(Roles = RoleConstants.SuperAdmin)]')
        $content = $content.Replace('[Authorize(Roles = "SuperAdmin,InventoryManager,PurchasingOfficer")]', '[Authorize(Roles = RoleConstants.SuperAdmin + "," + RoleConstants.InventoryManager + "," + RoleConstants.PurchasingOfficer)]')
        $content = $content.Replace('[Authorize(Roles = "SuperAdmin,InventoryManager")]', '[Authorize(Roles = RoleConstants.AdminOrManager)]')
        $content = $content.Replace('[Authorize(Roles = "SuperAdmin,InventoryManager,Sales,WarehouseStaff")]', '[Authorize(Roles = RoleConstants.SuperAdmin + "," + RoleConstants.InventoryManager + "," + RoleConstants.Sales + "," + RoleConstants.WarehouseStaff)]')
        $content = $content.Replace('[Authorize(Roles = "SuperAdmin,InventoryManager,PurchasingOfficer,WarehouseStaff")]', '[Authorize(Roles = RoleConstants.SuperAdmin + "," + RoleConstants.InventoryManager + "," + RoleConstants.PurchasingOfficer + "," + RoleConstants.WarehouseStaff)]')
        $content = $content.Replace('[Authorize(Roles = "SuperAdmin,InventoryManager,WarehouseStaff")]', '[Authorize(Roles = RoleConstants.SuperAdmin + "," + RoleConstants.InventoryManager + "," + RoleConstants.WarehouseStaff)]')
        $content = $content.Replace('[Authorize(Roles = "SuperAdmin,InventoryManager,Sales")]', '[Authorize(Roles = RoleConstants.SuperAdmin + "," + RoleConstants.InventoryManager + "," + RoleConstants.Sales)]')
        
        Set-Content -Path $file.FullName -Value $content
    }
}
