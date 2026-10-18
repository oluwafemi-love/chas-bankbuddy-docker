# BankBuddy — Deployment Guide

## 1. Overview

BankBuddy is a full-stack banking application deployed on an AWS EC2 instance using Docker containers.

The production deployment consists of:
- **Frontend:** Next.js
- **Backend:** Node.js and Express
- **Database:** MySQL running on the EC2 host
- **Containerization:** Docker and Docker Compose
- **Reverse proxy and HTTPS:** Nginx and Certbot
- **CI/CD:** GitHub Actions
- **Container registry:** GitHub Container Registry (GHCR)

## 2. Deployment architecture

A developer pushes code to the `main` branch. GitHub Actions validates the application, builds Docker images, publishes them to GHCR, and connects to EC2 over SSH to run the deployment script.

```text
Developer
   |
   v
GitHub: push to main
   |
   v
GitHub Actions
   |
   +--> Validate frontend and backend
   |
   +--> Build and publish Docker images
   |       |
   |       v
   |      GHCR
   |
   +--> SSH to EC2
           |
           v
      deploy.sh <commit-sha>
           |
           v
      Pull exact images
           |
           v
      Docker Compose
           |
           v
      Health checks
           |
      +----+----+
      |         |
     Pass      Fail
      |         |
      v         v
    Keep     Attempt rollback
    release  to previous release
```

## 3. CI/CD workflow

The workflow is defined in `.github/workflows/deploy.yml`.

### Continuous Integration

Before a deployment can proceed, GitHub Actions:
1. Checks out the repository.
2. Installs frontend dependencies.
3. Runs frontend linting.
4. Builds the frontend.
5. Installs backend dependencies.
6. Checks backend JavaScript syntax.

Automated application tests and dependency security checks are planned additions to this workflow.

### Image publication

After validation succeeds, GitHub Actions builds the backend and frontend Docker images and publishes them to GHCR.

Each image is tagged with the full Git commit SHA. This makes releases traceable to specific source code revisions.

### Production deployment

The deployment job connects to EC2 using SSH. SSH host verification is enabled, and credentials are stored in GitHub repository secrets.

The job executes:

`/home/ubuntu/bankbuddy/deploy.sh <full-commit-sha>`

The script pulls the requested images, updates the containers, and checks the frontend and API. If the checks fail, it attempts to restore the previous image tag.

## 4. Production configuration

The production Compose file is located at:

`/home/ubuntu/bankbuddy/docker-compose.prod.yml`

The deployment script is located at:

`/home/ubuntu/bankbuddy/deploy.sh`

The application uses the existing MySQL database on the EC2 host. Nginx handles public HTTPS traffic and routes requests to the frontend and backend containers.

Production environment files, private SSH keys, database credentials, and other secrets must not be committed to Git.

## 5. Deployment verification

After deployment, verify the running image tags:

```bash
sudo docker inspect bankbuddy-api bankbuddy-web \
  --format '{{.Name}} -> {{.Config.Image}}'
```

Check container status:

```bash
sudo docker ps \
  --filter name=bankbuddy-api \
  --filter name=bankbuddy-web
```

Check the public frontend:

```bash
curl -sS -o /dev/null \
  -w 'Homepage: %{http_code}\n' \
  https://13-63-79-123.sslip.io/
```

Check API validation through the public route:

```bash
curl -sS -o /dev/null \
  -w 'API: %{http_code}\n' \
  -X POST \
  -H 'Content-Type: application/json' \
  -d '{}' \
  https://13-63-79-123.sslip.io/api/users
```

The homepage is expected to return HTTP 200. An empty registration request is expected to return HTTP 400 because required fields are missing.

These checks confirm basic availability, not that every banking workflow works. Registration, login, and account operations should also be tested.

## 6. Rollback

The deployment script records the image tags currently used by the API and frontend before deploying a new release.

If deployment health checks fail, it attempts to restore the previous tag and verify the restored application.

If automatic rollback fails, inspect the container status and logs before attempting recovery:

```bash
sudo docker logs --tail 100 bankbuddy-api
sudo docker logs --tail 100 bankbuddy-web
```

Database restoration is a separate operation. Rolling back application images does not automatically reverse database changes.

## 7. Verified deployment record

- **Previous production baseline:** `c601afd`
- **Verified release commit:** `c601afdbcb1c947886a76500d93c4af331858ff4`
- **Verification date:** 17 October 2026
- **CI validation:** Passed
- **Docker image publication:** Passed
- **Automated EC2 deployment:** Passed
- **Public homepage:** HTTP 200
- **Public API validation probe:** HTTP 400, as expected
- **Container status:** Both application containers running
- **Browser verification:** User confirmed the live application works

