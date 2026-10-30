# Feature Flags

## Overview

BankBuddy uses runtime feature flags to control the availability of selected application features without requiring a new frontend build.

Feature flags are controlled through backend environment variables and exposed to the frontend through a dedicated API endpoint.

The current implementation uses one feature flag:

| Flag | Purpose | Default |
|---|---|---|
| `FEATURE_NEW_DASHBOARD` | Controls the Savings spotlight dashboard panel | `false` |

## Architecture

The feature flag follows this flow:

1. The backend reads `FEATURE_NEW_DASHBOARD` from its environment.
2. The backend exposes its value through `GET /feature-flags`.
3. The frontend requests the feature flags at runtime.
4. The frontend conditionally renders the Savings spotlight panel based on the returned boolean.

### Backend endpoint

**Endpoint:** `GET /feature-flags`

Example response when disabled:

```json
{
  "newDashboard": false
}
```

Example response when enabled:

```json
{
  "newDashboard": true
}
```

The backend enables the feature only when the environment variable is exactly the string `"true"`.

Values such as `"TRUE"`, `"1"`, `"yes"` and `"false"` do not enable the feature.

The endpoint also returns:

```http
Cache-Control: no-store
```

This prevents browsers and intermediate caches from retaining an outdated feature-flag response.

Only safe boolean values are exposed. Environment variables, credentials and other sensitive configuration are never returned.

## Frontend behaviour

The frontend retrieves feature flags using `getFeatureFlags()` in:

`frontend/app/lib/client.ts`

The account page uses the returned `newDashboard` value to determine whether to render the Savings spotlight panel.

The implementation follows a fail-closed approach:

- Flag enabled: the panel is displayed.
- Flag disabled: the panel is hidden.
- Feature-flag request fails: the panel remains hidden.

Feature flags are evaluated at runtime. Changing the backend flag does not require rebuilding the frontend.

## Local development

The flag is configured through:

`backend/.env`

To enable the feature locally:

```env
FEATURE_NEW_DASHBOARD=true
```

To disable it:

```env
FEATURE_NEW_DASHBOARD=false
```

Restart the backend after changing the environment variable so the application reads the updated value.

If the variable is omitted, the feature defaults to disabled.

**Important:** The actual `.env` file contains environment-specific configuration and must remain excluded from Git. Never commit secrets or production environment files.

## Production configuration

Production runs the API in Docker on EC2.

Relevant configuration:

- Environment file: `/home/ubuntu/bankbuddy/chas-bank-buddy-2/backend/.env`
- API container: `bankbuddy-api`
- API port: `3003`
- Public API endpoint: `https://13-63-79-123.sslip.io/api/feature-flags`

The production Docker Compose configuration loads the backend environment file using `env_file`.

Changing that file does not automatically update an existing container. The API container must be recreated to load the new environment.

### Enable the feature

1. SSH into the EC2 instance.
2. Edit the production backend environment file:

```bash
sudo nano /home/ubuntu/bankbuddy/chas-bank-buddy-2/backend/.env
```

3. Add or update:

```env
FEATURE_NEW_DASHBOARD=true
```

4. Save the file.

5. Recreate only the API container using its currently deployed image.

Run:

```bash
cd /home/ubuntu/bankbuddy

CURRENT_API_IMAGE=$(sudo docker inspect --format '{{.Config.Image}}' bankbuddy-api)

OVERRIDE_FILE=$(mktemp /home/ubuntu/bankbuddy/.flag-override.XXXXXX.yml)

trap 'rm -f "$OVERRIDE_FILE"' EXIT

cat > "$OVERRIDE_FILE" <<EOF
services:
  api:
    image: ${CURRENT_API_IMAGE}
EOF

sudo docker compose \
  -f /home/ubuntu/bankbuddy/docker-compose.prod.yml \
  -f "$OVERRIDE_FILE" \
  up -d --no-deps --force-recreate api
```

This preserves the currently deployed API image rather than using the older image tag in the base Compose file.

It also avoids restarting the frontend or MySQL.

### Disable the feature

Follow the same procedure, but set:

```env
FEATURE_NEW_DASHBOARD=false
```

If the variable is removed entirely, the backend defaults to disabled.

Recreate the API container using the same commands above.

### Verify the production configuration

Check the API container:

```bash
sudo docker ps --filter name=bankbuddy-api
```

Inspect recent logs:

```bash
sudo docker logs --tail 50 bankbuddy-api
```

Check the feature-flag endpoint locally on EC2:

```bash
curl -i http://127.0.0.1:3003/feature-flags
```

Or through the public API:

```bash
curl -i https://13-63-79-123.sslip.io/api/feature-flags
```

Confirm that:

- The response contains the expected boolean.
- The HTTP response includes `Cache-Control: no-store`.
- The API container is running.

### Production safety considerations

- Do not commit the production `.env` file.
- Do not print or share environment-file contents.
- Do not modify `docker-compose.prod.yml` just to toggle a feature.
- Do not rebuild the frontend to enable or disable a runtime flag.
- Recreate only the API container when changing its environment.
- The API may be briefly unavailable while its container restarts.
- Verify the endpoint after every change.
- Keep the existing deployment and rollback procedure intact.

## Automated tests

Feature flags are tested using Vitest and Supertest.

Backend tests:

```bash
npm test --prefix backend
```

Frontend browser tests:

```bash
npm run test:e2e --prefix frontend
```

The backend tests verify:

- The default disabled state.
- Explicit enablement using `"true"`.
- Rejection of unsupported flag values.
- The `Cache-Control: no-store` header.

The frontend Playwright tests verify:

- The panel appears when enabled.
- The panel remains hidden when disabled.
- The panel remains hidden when the feature-flag request fails.

## Adding future feature flags

When introducing another feature flag:

1. Add its environment variable with a disabled default.
2. Expose only its boolean value through `/feature-flags`.
3. Fetch it through the frontend feature-flag client.
4. Implement a safe fallback if fetching fails.
5. Add backend tests for its default and enabled states.
6. Add frontend tests for its visible and hidden states.
7. Update this documentation.

Feature flags should not expose sensitive configuration or replace authentication and authorization checks. Hiding a frontend component is not a security boundary; protected backend operations must enforce their own access controls.