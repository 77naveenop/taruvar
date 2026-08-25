Add-Type -AssemblyName System.Drawing

$src = "C:\Users\navee\.gemini\antigravity\brain\ea544b95-6464-40e7-b289-ed4831587e18\.user_uploaded\media_1787680867886.jpg"
$destDir = "C:\Users\navee\.gemini\antigravity\scratch\taruvar-website\public"

$img = [System.Drawing.Image]::FromFile($src)

function CreatePaddedPWAIcon($size, $outputPath) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    
    # Clean light natural background for safe zone
    $bgColor = [System.Drawing.ColorTranslator]::FromHtml("#F5F8F4")
    $g.Clear($bgColor)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    
    # 20% safe-zone margin to prevent maskable icon cropping on Android/iOS
    $margin = [int]($size * 0.15)
    $drawWidth = $size - ($margin * 2)
    $drawHeight = $size - ($margin * 2)
    
    $g.DrawImage($img, $margin, $margin, $drawWidth, $drawHeight)
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

CreatePaddedPWAIcon 192 "$destDir\pwa-192x192.png"
CreatePaddedPWAIcon 512 "$destDir\pwa-512x512.png"
CreatePaddedPWAIcon 180 "$destDir\apple-touch-icon.png"

$img.Dispose()
Write-Host "Generated padded PWA icons with safe-zone margin successfully!"
