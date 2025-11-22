# okx-calculate

Lightweight Node.js toolkit to aggregate OKX aggregated-trades, store compact summaries in Redis, and broadcast sanitized real-time summaries to browser dashboards.
## Overview

This repository provides a minimal, production-aware pipeline for collecting OKX spot aggregated-trades, computing per-coin time-windowed summaries, storing them in Redis, and broadcasting cleaned JSON payloads to browser clients via WebSocket.
### Core capabilities

- Real-time aggregation across multiple windows: 1m, 5m, 10m, 15m, 20m, 30m, 1h, 2h, 24h.
- Atomic per-slot updates implemented with a small Redis Lua script to avoid race conditions.
- Efficient writes with Redis pipelines.
- Sanitized publish channel (internal markers removed) for lightweight client consumption.
- Example browser dashboard with reconnect and debounced update logic.

## Repository layout
- `Aggregate.js` — ingest aggregated-trades and update Redis aggregates (uses Lua + pipeline).
- `PublishData.js` — read aggregated values from Redis, sanitize payloads, and publish to the public channel.
- `subscribe.js` — Redis pub/sub -> WebSocket bridge for client subscriptions.
- `websocket-example.html` — browser UI example (connects to `ws://localhost:8089` by default).
- `config.js` — channel names and Redis defaults.
- `tes/` — helper/test scripts.
## Requirements

- Node.js 16+ (LTS recommended)
- Redis 6+ (7 recommended)
Optional:

- Docker for running Redis locally: `docker run -p 6379:6379 redis:7`
## Quick start (local)

Clone and install:
```bash
git clone https://github.com/rahadiana/okx-calculate.git
cd okx-calculate
npm install
```

Start services (development flow):
1. Run the Redis -> WebSocket bridge:

```bash
node subscribe.js
```

2. Start the publisher that republishes sanitized payloads:

```bash
node PublishData.js
```

3. Start the aggregator (consumes exchange feed and writes aggregates):

```bash
node Aggregate.js
```

4. Open `websocket-example.html` in a browser (or serve it from a simple static server).

## Docker & docker-compose (development)

There is a `Dockerfile` and a `docker-compose.yml` included for local development. The Dockerfile uses `ENTRYPOINT ["node"]` and `CMD ["subscribe.js"]` so you can run any script in the image easily.

Build the image:

```bash
docker build -t okx-calc .
```

Start the full development stack (Redis + example services):

```bash
docker compose up --build
```

Compose services:
- `redis` — Redis server (6379)
- `bridge` — runs `node subscribe.js redis:6379` and exposes port `8089` for WebSocket clients
- `publisher` — runs `node PublishData.js redis:6379`
- `aggregator` — runs `node Aggregate.js redis:6379`
- `count` — runs `node count.js redis:6379`
- `generateavg` — runs `node GenerateAvg.js redis:6379` repeatedly (every 3 minutes)

Run a single service from the image (example: run aggregator only):

```bash
docker run --rm -it okx-calc Aggregate.js redis:6379
```

Notes on `generateavg` scheduling

The compose service `generateavg` runs `GenerateAvg.js` in a simple loop every 180 seconds (3 minutes). This is implemented in the compose command as `sh -c "while true; do node GenerateAvg.js redis:6379; sleep 180; done"` so each execution is visible in the container logs.

For production you may prefer one of these patterns:
- A dedicated scheduler (cron) container that triggers runs and writes logs per job.
- A tiny entrypoint script that waits for Redis then runs the job and exits (let orchestration schedule restarts).
- Use host-level cron or cloud schedulers for exact timing and observability.

## Configuration

`config.js` currently reads Redis host/port from the first CLI argument (e.g. `redis:6379`). In Docker Compose the service commands pass `redis:6379` so the scripts will use the compose Redis service.

Recommended improvement (optional): switch `config.js` to prefer environment variables `REDIS_PRIMARY`/`REDIS_SECONDARY` and fall back to CLI args. This is more idiomatic for container deployments; I can update this for you if you want.

## Scripts — details & behavior

### Aggregate.js

- Purpose: consume aggregated-trades, batch them, and write per-interval members into Redis.
- Key notes:
  - Loads a Lua script at startup (`zincrbyResetLua`) and uses `EVALSHA` for performance.
  - Uses Redis pipelines to batch commands; code ensures enqueued commands are present before calling `.exec()` to avoid races.
  - Writes keys under `OKX:SUMMARY:<date>:<instId>` and `COUNT:VOLCOIN:*` namespaces.

### PublishData.js

- Purpose: read the summary keys and publish sanitized JSON to the public channel.
- Key notes:
  - Strips internal `update_time_*` fields from published payloads.
  - Uses `ZRANGEBYSCORE` to read sorted-set members — if sets grow large, consider schema change to `HASH` or server-side Lua filters.

### subscribe.js

- Purpose: forward Redis pub/sub messages to connected WebSocket clients.
- Key notes:
  - Tracks subscribed channels to avoid duplicate subscribes.
  - Registers a single `message` handler for broadcasting to connected clients.

### websocket-example.html

- Example dashboard demonstrating filtering, sorting, and an Insight view per coin.
- Client features:
  - Reconnect handling (configurable interval in the example).
  - Debounced table updates to reduce DOM churn and CPU.
  - Defensive click wiring and optional debug helpers (if needed) to diagnose click-blocking overlays.

## Debug & smoke checks

- Verify Lua script loaded (logs printed by `Aggregate.js`) or use:

```bash
redis-cli SCRIPT EXISTS <sha>
```

- Inspect keys and sizes:

```bash
redis-cli KEYS "OKX:SUMMARY:*"
redis-cli ZCARD <key>
```

- Subscribe to public channel to inspect payloads (should not contain `update_time_*`):

```bash
redis-cli SUBSCRIBE <public-channel>
```

## Developer notes (recent changes)

- Separate Redis clients for pipeline vs publish (reduces head-of-line blocking).
- `InsertData()` is awaited so pipelines are fully populated before `.exec()`.
- Publish throttling added to avoid flooding clients.
- UI improvements in `websocket-example.html`: hover transforms removed, delegated click handling, debounced updates.
- `subscribe.js` made idempotent to avoid duplicate broadcasts on reconnect storms.

## Suggested next improvements (I can implement)

- Convert `updateTable()` to reuse DOM rows instead of clearing and recreating the entire table (fixes click instability).
- Update `config.js` to prefer environment variables (`REDIS_PRIMARY`, `REDIS_SECONDARY`) and fall back to CLI args for easier container deployments.
- Add a small `entrypoint.sh` that waits for Redis and runs jobs with per-run logging for `GenerateAvg`.
- Add basic metrics (connections, messages/sec, Redis latency) and a `pm2`/`systemd` or production `docker-compose` example.

## License & contact

- License: ISC
- Maintainer: Rahadiana Nugraha
# okx-calculate
Paket Node.js untuk menghitung dan menganalisis data perdagangan spot dari exchange OKX secara real-time.

## Fitur
- **Pengumpulan Data Ticker**: Harga, volume, perubahan persen untuk semua koin spot OKX.
- **Agregasi Trades**: Frekuensi dan volume buy/sell dalam interval waktu (1 menit hingga 2 jam).
- **Ringkasan Sentimen**: Persentase buy vs sell untuk analisis pasar.
- **Penyimpanan Redis**: Data disimpan di Redis untuk akses cepat.
- **Publikasi Real-Time**: Data dipublikasikan via Redis pub/sub.

## Prasyarat
*** Begin Clean README Replacement ***

# okx-calculate

Lightweight Node.js toolkit to aggregate OKX aggregated-trades, store compact summaries in Redis, and broadcast sanitized real-time summaries to browser dashboards.

## Overview

This repository provides a minimal, production-aware pipeline for collecting OKX spot aggregated-trades, computing per-coin time-windowed summaries, storing them in Redis, and broadcasting cleaned JSON payloads to browser clients via WebSocket.

Core capabilities

- Real-time aggregation across multiple windows: 1m, 5m, 10m, 15m, 20m, 30m, 1h, 2h, 24h.
- Atomic per-slot updates implemented with a small Redis Lua script to avoid race conditions.
- Efficient writes with Redis pipelines.
- Sanitized publish channel (internal markers removed) for lightweight client consumption.
- Example browser dashboard with reconnect and debounced update logic.

## Repository layout

- `Aggregate.js` — ingest aggregated-trades and update Redis aggregates (uses Lua + pipeline).
- `PublishData.js` — read aggregated values from Redis, sanitize payloads, and publish to the public channel.
- `subscribe.js` — Redis pub/sub -> WebSocket bridge for client subscriptions.
- `websocket-example.html` — browser UI example (connects to `ws://localhost:8089` by default).
- `config.js` — channel names and Redis defaults.
- `tes/` — helper/test scripts.

## Requirements

- Node.js 16+ (LTS recommended)
- Redis 6+ (7 recommended)

Optional:
- Docker for running Redis locally: `docker run -p 6379:6379 redis:7`

## Quick start

Clone and install:

```bash
git clone https://github.com/rahadiana/okx-calculate.git
cd okx-calculate
npm install
```

Start services (development flow):

1. Run the Redis -> WebSocket bridge:

```bash
node subscribe.js
```

 # okx-calculate

Lightweight Node.js toolkit to aggregate OKX aggregated-trades, store compact summaries in Redis, and broadcast sanitized real-time summaries to browser dashboards.

## Overview

This repository provides a minimal, production-aware pipeline for collecting OKX spot aggregated-trades, computing per-coin time-windowed summaries, storing them in Redis, and broadcasting cleaned JSON payloads to browser clients via WebSocket.

### Core capabilities

- Real-time aggregation across multiple windows: 1m, 5m, 10m, 15m, 20m, 30m, 1h, 2h, 24h.
- Atomic per-slot updates implemented with a small Redis Lua script to avoid race conditions.
- Efficient writes with Redis pipelines.
- Sanitized publish channel (internal markers removed) for lightweight client consumption.
- Example browser dashboard with reconnect and debounced update logic.

## Repository layout

- `Aggregate.js` — ingest aggregated-trades and update Redis aggregates (uses Lua + pipeline).
- `PublishData.js` — read aggregated values from Redis, sanitize payloads, and publish to the public channel.
- `subscribe.js` — Redis pub/sub -> WebSocket bridge for client subscriptions.
- `websocket-example.html` — browser UI example (connects to `ws://localhost:8089` by default).
- `config.js` — channel names and Redis defaults.
- `tes/` — helper/test scripts.

## Requirements

- Node.js 16+ (LTS recommended)
- Redis 6+ (7 recommended)

Optional:

- Docker for running Redis locally: `docker run -p 6379:6379 redis:7`

## Quick start

Clone and install:

```bash
git clone https://github.com/rahadiana/okx-calculate.git
cd okx-calculate
npm install
```

Start services (development flow):

1. Run the Redis -> WebSocket bridge:

```bash
node subscribe.js
```

2. Start the publisher that republishes sanitized payloads:

```bash
node PublishData.js
```

3. Start the aggregator (consumes exchange feed and writes aggregates):

```bash
node Aggregate.js
```

4. Open `websocket-example.html` in a browser (or serve it from a simple static server).

## Configuration

`config.js` provides defaults. Scripts accept an optional `redis_host:port` argument to override the primary Redis endpoint, for example:

```bash
node Aggregate.js 127.0.0.1:6379
```

## Scripts — details & behavior

### Aggregate.js

- Purpose: consume aggregated-trades, batch them, and write per-interval members into Redis.
- Key notes:
  - Loads a Lua script at startup (`zincrbyResetLua`) and uses `EVALSHA` for performance.
  - Uses Redis pipelines to batch commands; code ensures enqueued commands are present before calling `.exec()` to avoid races.
  - Writes keys under `OKX:SUMMARY:<date>:<instId>` and `COUNT:VOLCOIN:*` namespaces.

### PublishData.js

- Purpose: read the summary keys and publish sanitized JSON to the public channel.
- Key notes:
  - Strips internal `update_time_*` fields from published payloads.
  - Uses `ZRANGEBYSCORE` to read sorted-set members — if sets grow large, consider schema change to `HASH` or server-side Lua filters.

### subscribe.js

- Purpose: forward Redis pub/sub messages to connected WebSocket clients.
- Key notes:
  - Tracks subscribed channels to avoid duplicate subscribes.
  - Registers a single `message` handler for broadcasting to connected clients.

### websocket-example.html

- Example dashboard demonstrating filtering, sorting, and an Insight view per coin.
- Client features:
  - Reconnect handling (configurable interval in the example).
  - Debounced table updates to reduce DOM churn and CPU.
  - Defensive click wiring and optional debug helpers (if needed) to diagnose click-blocking overlays.

## Operational guidance & recommendations

- Reconnect policy: the example uses periodic reconnects; prefer exponential backoff with jitter in production.
- Durability: Redis Pub/Sub is ephemeral. For durability or replay consider Redis Streams, Kafka, or Pulsar.
- Scaling: if `ZRANGEBYSCORE` returns large sets, migrate to `HASH` for small fixed fields or use server-side Lua filters.

## Debug & smoke checks

- Verify Lua script loaded (logs printed by `Aggregate.js`) or use:

```bash
redis-cli SCRIPT EXISTS <sha>
```

- Inspect keys and sizes:

```bash
redis-cli KEYS "OKX:SUMMARY:*"
redis-cli ZCARD <key>
```

- Subscribe to public channel to inspect payloads:

```bash
redis-cli SUBSCRIBE <public-channel>
```

## Developer notes (recent changes)

- Separate Redis clients for pipeline vs publish (reduces head-of-line blocking).
- `InsertData()` is awaited so pipelines are fully populated before `.exec()`.
- Publish throttling added to avoid flooding clients.
- UI improvements in `websocket-example.html`: hover transforms removed, delegated click handling, debounced updates.
- `subscribe.js` made idempotent to avoid duplicate broadcasts on reconnect storms.

## Suggested next improvements (I can implement)

- Convert `updateTable()` to reuse DOM rows instead of clearing and recreating the entire table (fixes click instability).
- Add an `init` handshake so clients can request a snapshot on connect.
- Add `pm2`/`systemd` or `docker-compose` examples for production deployment.
- Expose basic metrics (connections, messages/sec, redis latency).

## License & contact

- License: ISC
- Maintainer: Rahadiana Nugraha