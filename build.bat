@echo off
cd %current_dir%
if "%1"=="--install" (
echo [94mInstalling Dependencies[0m
call npm install
if %ERRORLEVEL% == 0 goto :startBuild
echo [91mERROR: Error installing dependencies for Main LCD[0m
goto :done
)

:startBuild
echo [94mBuilding Main LCD[0m
call npm run build

if %ERRORLEVEL% == 0 goto :startCopy
echo [91mERROR: Error building Main LCD[0m
goto :done

:startCopy
echo [92mDone Building[0m
echo [94mCopying Main LCD files to EndPoint[0m
call xcopy /e /y /i /q "dist\MainLCD" "..\EndPointService\public\Apps\MainLCD"

if %ERRORLEVEL% == 0 goto :finish
echo [91mERROR: Error copying Main LCD files to EndPoint[0m
goto :done

:finish
echo [92mDone Copying[0m
goto :done

:done
echo Done