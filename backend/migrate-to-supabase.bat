@echo off
cd /d %~dp0
node scripts\migrateToSupabase.js
pause

