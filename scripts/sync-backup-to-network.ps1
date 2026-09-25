<#
.SYNOPSIS
    Sincronizacao incremental e espelhamento entre o repositorio local e a unidade de rede.
.DESCRIPTION
    Espelha C:\Users\Daniel Jose\DOC-Academy-local para T:\projetos\DOC-Academy utilizando Robocopy.
    Exclui estritamente pastas locais pesadas e arquivos locais sensiveis:
    /XD node_modules .next .turbo /XF .env.local
#>

[CmdletBinding()]
param(
    [string]$Source = "",
    [string]$Destination = "T:\projetos\DOC-Academy"
)

if ([string]::IsNullOrWhiteSpace($Source)) {
    if ($PSScriptRoot) {
        $Source = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
    } else {
        $Source = Join-Path $env:USERPROFILE "DOC-Academy-local"
    }
}

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  DOC-Academy: Backup Incremental para Rede (T:)" -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Origem:  $Source"
Write-Host "Destino: $Destination"
Write-Host "Data:    $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host ""

# Validacao do diretorio de origem
if (-not (Test-Path -LiteralPath $Source)) {
    Write-Error "Diretorio de origem nao encontrado: $Source"
    exit 1
}

# Validacao do diretorio de destino / unidade de rede
if (-not (Test-Path -LiteralPath $Destination)) {
    Write-Warning "Unidade de rede ou destino nao acessivel: $Destination"
    Write-Warning "Verifique se a unidade de rede T: esta conectada e acessivel."
    exit 2
}

Write-Host "Iniciando espelhamento incremental com Robocopy..." -ForegroundColor Yellow

# Execucao do Robocopy com exclusao estrita de node_modules, .next, .turbo e .env.local
# Codigos 0 a 7 no Robocopy indicam sucesso ou arquivos ja atualizados / copiados com exito.
& robocopy $Source $Destination /MIR /XD node_modules .next .turbo /XF .env.local /R:2 /W:2 /MT:8 /FFT /NP /NDL

$robocopyExit = $LASTEXITCODE

Write-Host ""
if ($robocopyExit -lt 8) {
    Write-Host "[OK] Backup incremental concluido com sucesso! (Codigo Robocopy: $robocopyExit)" -ForegroundColor Green
    exit 0
} else {
    Write-Host "[ERRO] Falha durante a sincronizacao do Robocopy. (Codigo Robocopy: $robocopyExit)" -ForegroundColor Red
    exit $robocopyExit
}
