# BankBuddy App

## Tech Stack
- Frontend: Next.js 16, React 19, TypeScript
- Backend: Express 5, Node.js ES modules
- Database: MySQL
 

## Deployment

BankBuddy is deployed on an AWS EC2 instance, with the frontend and backend running in separate Docker containers.

- Containerization: Docker Compose manages the production containers for the frontend and backend.

- Reverse Proxy: Nginx handles incoming HTTP requests and routes traffic to the appropriate application service.

- Process Management & Rollback: PM2 is retained as an alternative process-management setup to support potential rollback or recovery if needed.
  
  
## Link
- https://13-63-79-123.sslip.io






