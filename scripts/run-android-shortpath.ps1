param(
  [string]$BuildRoot = "C:\s",
  [string]$CxxRoot = "C:\cxx\smma-app"
)

$ErrorActionPreference = "Stop"

$sourceRoot = Split-Path -Parent $PSScriptRoot
$androidDir = Join-Path $BuildRoot "android"
$sourceAndroidDir = Join-Path $sourceRoot "android"

Write-Host "Syncing project to short path: $BuildRoot"

$robocopyArgs = @(
  $sourceRoot,
  $BuildRoot,
  "/MIR",
  "/XD", ".git", ".expo", "android\\build", "android\\app\\build"
)

$null = & robocopy @robocopyArgs
$robocopyExit = $LASTEXITCODE
if ($robocopyExit -ge 8) {
  throw "robocopy failed with exit code $robocopyExit"
}

try {
  Push-Location $sourceAndroidDir
  & .\gradlew.bat --stop | Out-Null
}
finally {
  Pop-Location
}

$pathsToClear = @(
  (Join-Path $BuildRoot "android\.gradle"),
  (Join-Path $BuildRoot "android\app\.cxx"),
  (Join-Path $sourceRoot "android\.gradle"),
  (Join-Path $sourceRoot "android\app\.cxx"),
  $CxxRoot
)

foreach ($path in $pathsToClear) {
  if (Test-Path -LiteralPath $path) {
    try {
      Remove-Item -LiteralPath $path -Recurse -Force -ErrorAction Stop
    } catch {
      Write-Warning "Failed to remove $path. Continuing cleanup. $($_.Exception.Message)"
    }
  }
}

foreach ($nodeModulesRoot in @(
  (Join-Path $BuildRoot "node_modules"),
  (Join-Path $sourceRoot "node_modules")
)) {
  if (Test-Path -LiteralPath $nodeModulesRoot) {
    Get-ChildItem -Path $nodeModulesRoot -Directory -Recurse -Filter build |
      Where-Object { $_.FullName -like "*\android\build" } |
      ForEach-Object {
        try {
          Remove-Item -LiteralPath $_.FullName -Recurse -Force -ErrorAction Stop
        } catch {
          Write-Warning "Failed to remove $($_.FullName). Continuing cleanup. $($_.Exception.Message)"
        }
      }

    Get-ChildItem -Path $nodeModulesRoot -Directory -Recurse -Filter .cxx |
      Where-Object { $_.FullName -like "*\android\.cxx" } |
      ForEach-Object {
        try {
          Remove-Item -LiteralPath $_.FullName -Recurse -Force -ErrorAction Stop
        } catch {
          Write-Warning "Failed to remove $($_.FullName). Continuing cleanup. $($_.Exception.Message)"
        }
      }
  }
}

Push-Location $androidDir
try {
  & .\gradlew.bat `
    app:assembleDebug `
    -x lint `
    -x test `
    --configure-on-demand `
    --build-cache `
    -PnewArchEnabled=false `
    -PreactNativeDevServerPort=8081 `
    "-PreactNativeArchitectures=x86_64,arm64-v8a"

  exit $LASTEXITCODE
}
finally {
  Pop-Location
}
