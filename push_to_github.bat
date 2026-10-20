@echo off
chcp 65001 >nul
title GeoAtlas 2026 - Day ma nguon len GitHub
set "PATH=C:\Program Files\Git\cmd;C:\Program Files\Git\mingw64\bin;%PATH%"
cd /d "%~dp0"

echo ===================================================================
echo     GEOATLAS 2026 - KET NOI VA DAY MA NGUON LEN GITHUB
echo ===================================================================
echo Repo muc tieu: https://github.com/nghiatnhcmue/ATLAS.git
echo Nhanh (Branch): main
echo.
echo Chon phuong thuc xac thuc:
echo   [1] Dang nhap tu dong bang Trinh duyet (Browser OAuth - Khuyen dung)
echo   [2] Nhap GitHub Personal Access Token (PAT)
echo.
set /p CH="Nhap lua chon cua Thay (1 hoac 2) roi bam Enter [Mac dinh 1]: "

if "%CH%"=="2" goto with_pat

:with_oauth
echo.
echo Dang goi Git va mo trinh duyet de xac thuc...
echo (Neu trinh duyet mo ra, Thay chi can bam nut xanh 'Authorize' nhe)
echo.
git config --global credential.guiPrompt false
git remote set-url origin https://github.com/nghiatnhcmue/ATLAS.git
git push -u origin main
goto end

:with_pat
echo.
echo Huong dan lay Token nhanh:
echo 1. Mo https://github.com/settings/tokens
echo 2. Generate new token (classic) -> tich chon 'repo' -> bam Generate
echo.
set /p TOKEN="Dan ma Token vao day roi bam Enter: "
if "%TOKEN%"=="" (
    echo Token trong, da huy.
    goto end
)
echo Dang day len GitHub bang Token...
git push -u https://%TOKEN%@github.com/nghiatnhcmue/ATLAS.git main
if %ERRORLEVEL% EQU 0 (
    git remote set-url origin https://github.com/nghiatnhcmue/ATLAS.git
)
goto end

:end
echo.
if %ERRORLEVEL% EQU 0 (
    echo ===================================================================
    echo   [XONG] CHUC MUNG THAY! DU AN DA DUOC DAY LEN GITHUB THANH CONG!
    echo.
    echo   De trang web chay vinh vien tren GitHub Pages:
    echo   1. Mo: https://github.com/nghiatnhcmue/ATLAS/settings/pages
    echo   2. Tai "Source", chon "Deploy from a branch"
    echo   3. Chon Branch "main", Folder "/ (root)" roi bam Save.
    echo   4. Trang web se online tai: https://nghiatnhcmue.github.io/ATLAS/
    echo ===================================================================
) else (
    echo [CHU Y] Neu gap loi xac thuc trinh duyet, Thay chay lai file nay va chon [2] de dung Token nhe!
)
echo.
pause
