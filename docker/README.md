Docker compose setup

This repo includes a docker-compose.yml that brings up:
- MySQL 8 (db)
- backend (Spring Boot) built from ./backend
- frontend served by nginx built from ./frontend

Default DB credentials in docker-compose.yml: root / change_me. Update as needed.

Usage:
- Windows PowerShell: ./start-services.ps1
- Stop: ./stop-services.ps1
