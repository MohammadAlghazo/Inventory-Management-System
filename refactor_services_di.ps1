$appDir = 'InventoryManagement.Application\Services'

Get-ChildItem -Recurse $appDir -Filter "*.cs" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $updated = $content -replace "AppDbContext _db", "IAppDbContext _db"
    $updated = $updated -replace "AppDbContext context", "IAppDbContext context"
    $updated = $updated -replace "AppDbContext dbContext", "IAppDbContext dbContext"
    $updated = $updated -replace "public (\w+Service)\(AppDbContext", "public $1(IAppDbContext"
    $updated = $updated -replace "using InventoryManagement.Infrastructure.Data;", "using InventoryManagement.Application.Common.Interfaces;"
    if ($content -ne $updated) {
        Set-Content $_.FullName $updated -NoNewline
    }
}
