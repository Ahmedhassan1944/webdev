
Add-Type -AssemblyName System.Drawing

function Remove-Background {
    param (
        [string]$SourcePath,
        [string]$DestPath
    )
    
    Write-Host "Processing $SourcePath..."
    
    if (-not (Test-Path $SourcePath)) {
        Write-Error "File not found: $SourcePath"
        return
    }

    $bitmap = [System.Drawing.Bitmap]::FromFile($SourcePath)
    
    # Get the color of the top-left pixel to use as the background color to remove
    $bgColor = $bitmap.GetPixel(0, 0)
    Write-Host "Detected background color: $bgColor"
    
    # Make that color transparent
    $bitmap.MakeTransparent($bgColor)
    
    # Save to new file
    $bitmap.Save($DestPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $bitmap.Dispose()
    Write-Host "Saved transparent version to $DestPath"
}

$root = "d:\CV-Website\images"
Remove-Background -SourcePath "$root\cursor-default.png" -DestPath "$root\users-cursor-transparent.png"
Remove-Background -SourcePath "$root\cursor-pointer.png" -DestPath "$root\users-cursor-pointer-transparent.png"
