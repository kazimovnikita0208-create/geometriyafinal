@echo off
cd /d %~dp0
node scripts\checkMigration.js
pause

