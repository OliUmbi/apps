$ErrorActionPreference = "Stop"
$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$snapshotPath = Join-Path $PSScriptRoot "schema.sql"
$temporaryPath = Join-Path $PSScriptRoot "schema.sql.tmp"
$databaseUser = if ($env:POSTGRES_MIGRATOR_USER) { $env:POSTGRES_MIGRATOR_USER } else { "apps_migrator" }
$databaseName = if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { "apps" }

Push-Location $projectRoot
try {
    docker compose up -d postgres
    docker compose run --rm flyway
    docker compose exec -T postgres pg_dump `
        --username $databaseUser `
        --dbname $databaseName `
        --schema-only `
        --no-owner `
        --exclude-table public.flyway_schema_history |
        Where-Object { $_ -notmatch '^\\(un)?restrict ' } |
        Set-Content -Encoding utf8 $temporaryPath

    Move-Item -Force -LiteralPath $temporaryPath -Destination $snapshotPath
    Write-Host "Updated $snapshotPath"
}
finally {
    if (Test-Path -LiteralPath $temporaryPath) {
        Remove-Item -LiteralPath $temporaryPath
    }
    Pop-Location
}
