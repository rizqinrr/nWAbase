# nWAbase

## Process lifecycle

- `SIGINT` and `SIGTERM` invoke one idempotent graceful shutdown.
- Shutdown attempts to close the socket, plugin watcher, readline, and databases independently; one close failure does not stop the others.
- `uncaughtException` and `unhandledRejection` are logged with a generic message and do not print the original error payload.
- The runtime entrypoint owns process exit policy; the connection helpers only register handlers and close resources.
