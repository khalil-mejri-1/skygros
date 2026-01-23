# Script to update all API calls to use API_BASE_URL
$files = @(
    "src\pages\TwoFAVerify.jsx",
    "src\pages\TwoFASetup.jsx",
    "src\pages\ProductDetails.jsx",
    "src\pages\Panier.jsx",
    "src\pages\Admin.jsx",
    "src\pages\Historique.jsx",
    "src\components\ProductCard.jsx",
    "src\components\Navbar.jsx",
    "src\components\Footer.jsx"
)

$clientPath = "c:\Users\khalil\Desktop\khalil\project_react\skygros\client"

foreach ($file in $files) {
    $fullPath = Join-Path $clientPath $file
    
    if (Test-Path $fullPath) {
        Write-Host "Processing: $file" -ForegroundColor Cyan
        
        $content = Get-Content $fullPath -Raw
        
        # Check if API_BASE_URL import already exists
        if ($content -notmatch 'import API_BASE_URL') {
            # Find the last import statement
            if ($content -match '(?s)(import.*?from.*?;)\s*\n') {
                $lastImport = $matches[0]
                $importStatement = "`nimport API_BASE_URL from `"../config/api`";`n"
                $content = $content -replace [regex]::Escape($lastImport), "$lastImport$importStatement"
            }
        }
        
        # Replace all axios calls
        $content = $content -replace 'axios\.(get|post|put|delete|patch)\("(/api/[^"]+)"', 'axios.$1(`${API_BASE_URL}$2`'
        $content = $content -replace "axios\.(get|post|put|delete|patch)\('(/api/[^']+)'", 'axios.$1(`${API_BASE_URL}$2`'
        
        # Save the file
        $content | Set-Content $fullPath -NoNewline
        Write-Host "Updated: $file" -ForegroundColor Green
    }
    else {
        Write-Host "Not found: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "All files processed!" -ForegroundColor Yellow
