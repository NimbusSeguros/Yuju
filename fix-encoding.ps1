$path = 'c:\Users\schut\yuju\src\pages\Cotizadores\MotoCotizador.tsx'
$content = [System.IO.File]::ReadAllText($path)
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Host "Re-saved as UTF-8 without BOM"
