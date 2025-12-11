@echo off
echo Mapping V: drive to workaround Windows path length limit...
:: Map V: to the parent directory (web-admin)
subst V: "%~dp0.."
if errorlevel 1 (
    echo V: drive might already be mapped. Attempting to continue using existing mapping...
)

echo Switching to V: drive...
V:
cd react-native-migration

echo Running Android Build...
cd android
call .\gradlew.bat assembleDebug

if %ERRORLEVEL% EQU 0 (
   echo.
   echo ================================================================
   echo BUILD SUCCESSFUL!
   echo APK location: V:\react-native-migration\android\app\build\outputs\apk\debug\app-debug.apk
   echo ================================================================
   echo.
   echo To run on device/emulator, use: npx expo run:android
   echo (Ensure you are on V: drive when running expo commands if possible)
) else (
   echo Build Failed.
)
pause
