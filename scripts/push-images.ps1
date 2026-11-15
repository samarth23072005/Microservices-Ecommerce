# Docker Hub Publishing Script for ShopKart Microservices
param (
    [string]$Tag = "latest"
)

$images = @(
    "samarth23072005/ecommerce-frontend",
    "samarth23072005/ecommerce-api-gateway",
    "samarth23072005/ecommerce-user-service",
    "samarth23072005/ecommerce-product-service",
    "samarth23072005/ecommerce-order-service"
)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  Pushing Microservices Images to Docker Hub (Tag: $Tag)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

foreach ($img in $images) {
    $fullImage = "$img`:$Tag"
    Write-Host "`n[Docker Hub] Pushing $fullImage ..." -ForegroundColor Yellow
    docker push $fullImage
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to push $fullImage to Docker Hub."
        exit 1
    }
    Write-Host "[Docker Hub] Successfully pushed $fullImage" -ForegroundColor Green
}

Write-Host "`n============================================================" -ForegroundColor Green
Write-Host "  All 5 microservice images successfully pushed to Docker Hub!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
