@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
set GIT_EXE="%~dp0tools\mingit\cmd\git.exe"

echo ===================================================================
echo     GEOATLAS 2026 - KẾT NỐI VÀ ĐẨY DỰ ÁN LÊN GITHUB
echo ===================================================================
echo.
echo 1. Hãy tạo 1 Repository MỚI trên GitHub (https://github.com/new)
echo    - Tên repo ví dụ: geoatlas hoặc atlat-dia-ly
echo    - Để Public hoặc Private tùy Thầy
echo    - KHÔNG tích chọn "Add a README file"
echo.
echo 2. Sao chép link HTTPS của repo (ví dụ: https://github.com/thaynghia/geoatlas.git)
echo.
set /p REPO_URL="Dán link Repo GitHub vào đây rồi bấm Enter: "

if "%REPO_URL%"=="" (
    echo Chưa nhập link. Đã huỷ thao tác.
    pause
    exit /b
)

%GIT_EXE% remote remove origin >nul 2>&1
%GIT_EXE% remote add origin %REPO_URL%

echo.
echo Đang đẩy mã nguồn lên nhánh 'main' trên GitHub...
%GIT_EXE% push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===================================================================
    echo   THÀNH CÔNG! Dự án đã được đưa lên GitHub.
    echo.
    echo   BẬT WEB CHẠY VĨNH VIỄN TRÊN GITHUB PAGES:
    echo   1. Vào repo trên GitHub -> Settings -> Pages.
    echo   2. Tại "Build and deployment", chọn Source là "Deploy from a branch".
    echo   3. Chọn Branch "main" và folder "/(root)" -> Bấm Save.
    echo   4. Chờ 1 phút, trang web sẽ online tại: https://<username>.github.io/<repo>/
    echo ===================================================================
) else (
    echo.
    echo Có thể cần đăng nhập tài khoản GitHub hoặc kiểm tra lại đường dẫn repo.
)

pause
