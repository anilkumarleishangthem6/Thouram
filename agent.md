# Agent Guide

## Project Stack

- **Frontend:** React with Vite (or Next.js if the project requirements call for server-rendered routing).
- **Backend:** Node.js with Express.
- **Styling:** Tailwind CSS.
- **Database:** MongoDB, accessed through a clearly defined model/data-access layer.
- **Language:** Use JavaScript by default; use TypeScript when the project is configured for it, and keep types consistent across each application.

Keep the frontend in `client/` and the API/backend in `server/`. Keep server models in `server/models/`, route modules in `server/routes/`, and the Express application entry point in `server/server.js`.

## Package Manager and Commands

Use **npm** and commit the lockfile for each independently managed package. Install dependencies from the directory containing the relevant `package.json` with `npm install`.

Start the development server with:

```sh
npm run dev
```

Each app/package that is expected to run independently must define a `dev` script. From the repository root, `npm run dev` should start the intended development workflow (for example, both client and server through a root script); document any package-specific commands when the repository setup defines them. Do not assume a script exists until it is present in `package.json`.

## Code Conventions

- Build modular React components with a clear, single responsibility. Keep reusable UI in focused components and shared behavior in hooks or utilities.
- Keep Express route modules focused on URL and middleware wiring. Put request handling in thin controllers or small route handlers, and put business rules and persistence logic in appropriate service/model layers.
- Validate and normalize untrusted input at API boundaries. Use consistent response shapes and appropriate HTTP status codes.
- Handle errors explicitly: propagate asynchronous failures to centralized Express error middleware, return actionable client-safe messages, and never silently swallow exceptions. Do not expose stack traces or internal details in production responses.
- Use descriptive names, small functions, consistent formatting, and existing project lint/format rules. Avoid unnecessary duplication and keep modules easy to test.
- Keep configuration in environment variables and document required variable names in a safe example file such as `.env.example`.
- Add or update tests when changing behavior, following the repository's existing test setup.

## Security and Guardrails

- **Never hardcode secrets, credentials, private keys, tokens, or production connection strings.** Read them from environment variables or an approved secret store.
- Never commit real `.env` files or credentials. Keep secret-bearing files out of version control.
- Do not log passwords, tokens, session identifiers, or sensitive personal data.
- Apply least privilege to database access, validate data before persistence, and use safe query patterns.
- Do not disable security checks or weaken validation to make a demo pass. If a shortcut is needed, make its scope explicit and keep it safe for local development.
- Preserve existing user changes and project conventions. Make the smallest coherent change that fulfills the task.
