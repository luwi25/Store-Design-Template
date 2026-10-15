$ErrorActionPreference = 'Stop'
$appRoot = $PSScriptRoot
$serviceUrl = 'http://127.0.0.1:8766'
function Test-StoreService {
    try { return (Invoke-RestMethod -Uri "$serviceUrl/api/health" -TimeoutSec 2).service -eq 'store-design-database' }
    catch { return $false }
}
if (-not (Test-StoreService)) {
    $python = Join-Path $appRoot '.venv\Scripts\python.exe'
    if (-not (Test-Path -LiteralPath $python)) { $python = (Get-Command python.exe -ErrorAction Stop).Source }
    $pythonWindowless = Join-Path (Split-Path $python) 'pythonw.exe'
    if (-not (Test-Path -LiteralPath $pythonWindowless)) { $pythonWindowless = $python }
    Start-Process -FilePath $pythonWindowless -ArgumentList ('"' + (Join-Path $appRoot 'server.py') + '"') -WorkingDirectory $appRoot -WindowStyle Hidden
    for ($attempt = 0; $attempt -lt 40; $attempt++) {
        if (Test-StoreService) { break }
        Start-Sleep -Milliseconds 250
    }
    if (-not (Test-StoreService)) { throw 'Could not start the local database. Port 8766 may be in use. Open server.py with Python to see the error.' }
}
# Open the original file origin so existing browser saves can migrate automatically.
$appUri = [System.Uri]::new((Join-Path $appRoot 'index.html')).AbsoluteUri
Start-Process $appUri
