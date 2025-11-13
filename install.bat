@echo off
echo ========================================
echo Dental Inventory Management System
echo Installation Script for Windows
echo ========================================
echo.

echo [1/4] Installing Backend Dependencies...
cd Backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed!
    pause
    exit /b %errorlevel%
)
echo Backend dependencies installed successfully!
echo.

echo [2/4] Installing Frontend Dependencies...
cd ..\Frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed!
    pause
    exit /b %errorlevel%
)
echo Frontend dependencies installed successfully!
echo.

echo [3/4] Checking for .env file...
cd ..\Backend
if not exist .env (
    echo WARNING: .env file not found!
    echo Please create a .env file in the Backend directory with the following:
    echo.
    echo DB_HOST=localhost
    echo DB_USER=root
    echo DB_PASSWORD=your_password
    echo DB_NAME=business4
    echo DB_PORT=3306
    echo PORT=3000
    echo NODE_ENV=development
    echo JWT_SECRET=your_jwt_secret_key_here
    echo JWT_EXPIRE=7d
    echo GEMINI_API_KEY=your_gemini_api_key_here
    echo.
) else (
    echo .env file found!
)
echo.

echo [4/4] Installation Summary
echo ========================================
echo Backend: Dependencies installed
echo Frontend: Dependencies installed
echo.
echo Next Steps:
echo 1. Configure your .env file in the Backend directory
echo 2. Set up MySQL database and import schema files
echo 3. Run 'cd Backend && npm start' to start the backend server
echo 4. Run 'cd Frontend && npm start' to start the frontend app
echo 5. Access the app at http://localhost:3002
echo.
echo For detailed instructions, see README.md
echo ========================================
echo.
echo Installation completed successfully!
pause
