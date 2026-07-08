#!/usr/bin/env pwsh
Set-StrictMode -Version Latest
Push-Location $PSScriptRoot
Write-Output "Building and starting services with docker-compose..."
docker-compose -f "$PSScriptRoot/docker-compose.yml" up -d --build
Pop-Location
