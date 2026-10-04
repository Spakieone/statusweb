#!/bin/bash
# pipefail is load-bearing: the exit status of `pg_dump | gzip` is *gzip's*, and
# gzip compresses a truncated stream and exits 0. Without it a pg_dump that died
# halfway was written out as the day's backup, the retention sweep below then
# deleted a good older one to make room, and nothing anywhere said a word.
set -o pipefail
# umask is load-bearing for the same reason pipefail is: `>` creates the file
# 0666 & ~umask, so without this the day's dump — the whole panel database,
# including `servers.agent_token` in cleartext — lands 0644 on a box that also
# runs other people's PHP as www-data.
umask 077
BACKUP_DIR="/var/backups/dockpanel/db"
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR" /var/backups/dockpanel 2>/dev/null || true
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUT="$BACKUP_DIR/dockpanel_$TIMESTAMP.sql.gz"
if ! docker exec dockpanel-postgres pg_dump -U dockpanel -d dockpanel | gzip > "$OUT"; then
    echo "dockpanel db-backup: pg_dump failed, discarding $OUT" >&2
    rm -f "$OUT"
    exit 1
fi
# A zero exit is not the success condition — a whole dump is. pg_dump emits this
# marker near the end; its absence means the file is short whatever exited 0.
if ! gunzip -c "$OUT" | tail -20 | grep -c 'PostgreSQL database dump complete' >/dev/null; then
    echo "dockpanel db-backup: $OUT is incomplete, discarding" >&2
    rm -f "$OUT"
    exit 1
fi
# Keep last 7 days — only ever reached once today's backup is known good, so a
# bad run can never evict a good one.
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +7 -delete
