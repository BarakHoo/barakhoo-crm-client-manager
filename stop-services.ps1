#!/usr/bin/env pwsh
Set-StrictMode -Version Latest
Push-Location $PSScriptRoot
Write-Output "Stopping and removing services..."
docker-compose -f "$PSScriptRoot/docker-compose.yml" down
Pop-Location
