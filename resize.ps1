Add-Type -AssemblyName System.Drawing

$src = "C:\Users\navee\.gemini\antigravity\brain\ea544b95-6464-40e7-b289-ed4831587e18\.user_uploaded\media_1787680867886.jpg"
$destDir = "C:\Users\navee\.gemini\antigravity\scratch\taruvar-website\public"

# Copy full resolution logo
Copy-Item $src "$destDir\logo.jpg" -Force
Copy-Item $src "$destDir\logo.png" -Force

$img = [System.Drawing.Image]::FromFile($src)

function ResizeImage($width, $height, $outputPath) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($img, 0, 0, $width, $height)
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

ResizeImage 192 192 "$destDir\pwa-192x192.png"
ResizeImage 512 512 "$destDir\pwa-512x512.png"
ResizeImage 180 180 "$destDir\apple-touch-icon.png"
ResizeImage 64 64 "$destDir\favicon.png"
ResizeImage 32 32 "$destDir\favicon-32x32.png"

$img.Dispose()
Write-Host "Generated all Taruvar logo sizes successfully!"
