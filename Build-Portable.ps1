param([switch]$UseExistingPackage, [string]$BuildDirectory = "dist", [string]$ElectronDist = "")

$ErrorActionPreference = 'Stop'
Push-Location $PSScriptRoot
try {
    if (-not $UseExistingPackage) {
        $builder = @("exec", "--", "electron-builder", "--win", "--x64", "--dir",
            "--config.directories.output=$BuildDirectory")
        if ($ElectronDist) { $builder += "--config.electronDist=$ElectronDist" }
        npm.cmd @builder
        if ($LASTEXITCODE -ne 0) { throw 'Build Electron non riuscita.' }
    }
    $app = (Resolve-Path (Join-Path $BuildDirectory "win-unpacked")).Path
    $payload = Join-Path $PSScriptRoot (Join-Path $BuildDirectory "studio-payload.zip")
    $output = Join-Path $PSScriptRoot (Join-Path $BuildDirectory "Keymap-Studio-Portable.exe")
    $compiler = Join-Path $env:windir 'Microsoft.NET/Framework64/v4.0.30319/csc.exe'
    $icon = Join-Path $PSScriptRoot 'icon.ico'
    $source = Join-Path $PSScriptRoot 'Launcher.cs'

    tar.exe -a -cf $payload -C $app .
    if ($LASTEXITCODE -ne 0) { throw 'Compressione non riuscita.' }

    & $compiler /nologo /target:winexe /platform:x64 /optimize+ /reference:System.Windows.Forms.dll `
        /reference:System.IO.Compression.dll /reference:System.IO.Compression.FileSystem.dll `
        "/win32icon:$icon" "/resource:$payload,StudioPayload" "/out:$output" $source
    if ($LASTEXITCODE -ne 0) { throw 'Compilazione del launcher non riuscita.' }
} finally {
    Pop-Location
}
