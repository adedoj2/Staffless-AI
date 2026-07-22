# Migration notes

- The primary backend is now the FastAPI service in apps/backend-py.
- The legacy Node/Express backend (apps/backend-api) is deprecated. It remains in the repo for reference, but should be removed or archived once you confirm feature parity and successful migration.

Recommended removal steps (manual)

To remove the Node backend after verifying FastAPI works for you, run:

```bash
# from repo root
git mv apps/backend-api apps/backend-api.deprecated
git commit -m "Deprecate legacy Node backend (moved to apps/backend-api.deprecated)"
```

I added this script if you prefer to remove via script:

scripts/remove_node_backend.sh

Use it locally (it will move the directory):

```bash
chmod +x scripts/remove_node_backend.sh
./scripts/remove_node_backend.sh
```
