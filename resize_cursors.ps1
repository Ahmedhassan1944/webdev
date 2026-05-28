
Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param (
        [string]$SourcePath,
        [string]$DestPath,
        [int]$Width,
        [int]$Height
    )
    
    Write-Host "Resizing $SourcePath to $DestPath (${Width}x${Height})..."
    
    $srcImage = [System.Drawing.Image]::FromFile($SourcePath)
    $newBitmap = New-Object System.Drawing.Bitmap($Width, $Height)
    $graphics = [System.Drawing.Graphics]::FromImage($newBitmap)
    
    # High quality resizing
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $graphics.DrawImage($srcImage, 0, 0, $Width, $Height)
    
    $newBitmap.Save($DestPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $newBitmap.Dispose()
    $srcImage.Dispose()
}

$root = "d:\CV-Website\images"
Resize-Image -SourcePath "$root\path-66-at-2x-removebg-preview.png" -DestPath "$root\path-66-at-2x-removebg-preview_32x32.png" -Width 32 -Height 32
Resize-Image -SourcePath "$root\edecs-30-years-removebg-preview(3).png" -DestPath "$root\edecs-30-years-removebg-preview(3)_32x32.png" -Width 32 -Height 32
