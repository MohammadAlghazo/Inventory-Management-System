$apiDir = 'Inventory Management'
$domainDir = 'InventoryManagement.Domain'
$appDir = 'InventoryManagement.Application'
$infraDir = 'InventoryManagement.Infrastructure'

Move-Item -Path "$apiDir\Models" -Destination "$domainDir\Entities"
Move-Item -Path "$apiDir\Common" -Destination "$domainDir\Common"
Move-Item -Path "$apiDir\Dtos" -Destination "$appDir\Dtos"
Move-Item -Path "$apiDir\Services" -Destination "$appDir\Services"
Move-Item -Path "$apiDir\_DbContext" -Destination "$infraDir\Data"
Move-Item -Path "$apiDir\Migrations" -Destination "$infraDir\Migrations"

New-Item -ItemType Directory -Force "$infraDir\Services"
Move-Item -Path "$appDir\Services\GoogleAppsScriptEmailService.cs" -Destination "$infraDir\Services\"
