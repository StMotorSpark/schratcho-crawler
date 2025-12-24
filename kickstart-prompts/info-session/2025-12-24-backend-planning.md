# Backend Planning Notes — 2025-12-24

## API Auth Strategy
- Short term: gate REST API with API Gateway API keys + usage plan, locked to HTTPS and origin-filtered CORS; document in backend/README.md when added.
- Mid term: add AWS Cognito User Pool + app client for the web app; protect endpoints with a Cognito JWT authorizer so only the deployed frontend can call the API.
- Enforce per-origin throttling via AWS WAF once public traffic grows; keep Lambda roles scoped to least privilege.
- All auth changes should be reflected in backend/STORAGE.md including token requirements and rotation cadence.

## Frontend Deployment Updates
- Move Vite build output from GitHub Pages to an S3 static site fronted by CloudFront; host this in a dedicated "frontend" CDK stack to keep separation from API infra.
- Lock bucket access behind an Origin Access Control (OAC), and use Route 53 aliases when a custom domain is ready.
- Update CI (GitHub Actions) to run `npm run build`, `aws s3 sync dist/ s3://<bucket>`, then issue a CloudFront invalidation.
- Document the new deployment flow in README.md and keep dist/ artifacts out of git as usual.

## User Accounts & Shared Progression
- Target flow: Cognito Hosted UI (or custom UI) issues access/refresh tokens; frontend stores them securely and attaches JWTs to API Gateway calls.
- Backend resolves Cognito `sub` to a canonical user id and persists progression/state in DynamoDB (extend current user-state schema or add a dedicated table).
- Add sync logic in core/user-state to merge local browser progress with server snapshots; define conflict resolution rules (server-wins vs client-wins) and handle offline fallbacks.
- Dev checklist: infra updates (Cognito, IAM policies, new tables), migration scripts for existing local data, token refresh handling, and documentation of the end-to-end login + sync lifecycle for the team.
