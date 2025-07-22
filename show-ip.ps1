# Get local IP address and display access links

$IPAddresses = Get-NetIPAddress | Where-Object {
    $_.AddressFamily -eq "IPv4" -and
    $_.PrefixOrigin -ne "WellKnown" -and
    $_.IPAddress -ne "127.0.0.1"
} | Select-Object -ExpandProperty IPAddress

Write-Host "`nTetris Game PWA Local Server`n" -ForegroundColor Green
Write-Host "Make sure your iPad is on the same WiFi network as your computer" -ForegroundColor Yellow
Write-Host "Access one of the following addresses in iPad Safari browser:`n" -ForegroundColor Yellow

foreach ($IP in $IPAddresses) {
    Write-Host "http://$($IP):8000" -ForegroundColor Cyan
}

Write-Host "`nAfter accessing, click the share button and select 'Add to Home Screen' to install the PWA app`n" -ForegroundColor Green

Read-Host "Press Enter to exit"