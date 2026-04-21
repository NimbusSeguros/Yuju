$file = 'c:\Users\schut\yuju\src\pages\Cotizadores\MotoCotizador.tsx'
$lines = Get-Content $file
# Keep lines 1-879 (0-indexed: 0-878) and 923-end (0-indexed: 922+)
$newLines = $lines[0..878] + $lines[922..($lines.Length-1)]
[System.IO.File]::WriteAllLines($file, $newLines)
Write-Host "Done. New total lines: $($newLines.Length)"
