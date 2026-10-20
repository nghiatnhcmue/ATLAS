Add-Type -AssemblyName Microsoft.VisualBasic
Add-Type -AssemblyName System.Windows.Forms

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$git = Join-Path $rootDir "tools\mingit\cmd\git.exe"

$url = [Microsoft.VisualBasic.Interaction]::InputBox(
    "Vui lòng dán link GitHub Repository của Thầy vào đây:`n`n(Ví dụ: https://github.com/username/geoatlas.git)",
    "GeoAtlas 2026 - Kết Nối GitHub",
    ""
)

if ([string]::IsNullOrWhiteSpace($url)) {
    [System.Windows.Forms.MessageBox]::Show("Chưa nhập link Repo. Thao tác đã được huỷ.", "GeoAtlas 2026", "OK", "Information")
    exit
}

$url = $url.Trim()

Set-Location $rootDir
& $git remote remove origin 2>$null
& $git remote add origin $url

$proc = Start-Process -FilePath $git -ArgumentList "push -u origin main" -NoNewWindow -Wait -PassThru

if ($proc.ExitCode -eq 0) {
    [System.Windows.Forms.MessageBox]::Show("CHÚC MỪNG THẦY!`n`nDự án đã được đẩy lên GitHub thành công!`nThầy có thể vào Settings > Pages trên GitHub để bật web vĩnh viễn.", "Thành Công", "OK", "Information")
} else {
    [System.Windows.Forms.MessageBox]::Show("Chưa thể đẩy lên GitHub.`n`nThầy có thể gửi trực tiếp link Repo vào ô chat để em xử lý ngay giúp Thầy nhé!", "Thông Báo", "OK", "Warning")
}
