# Architecture

Dishcraft is a recipe application for discovering, adapting, and saving recipes. Users can find recipes through personalized recommendations, request changes in natural language, review successive drafts, and save the version they want to keep.

That product experience produces several kinds of state: interactive requests, complete draft snapshots, durable normalized recipes, and recommendation data generated from user behavior. The architecture connects these responsibilities through a TypeScript web and API layer, a shared PostgreSQL system of record, and a separate Python package for recommendation experiments and scheduled computation. This article follows those boundaries from the request path through deployment, testing, and operations.

## 1. The Architecture at a Glance

At a high level, the system looks like this:

![Dishcraft system architecture showing the web application, API, persistent data, background jobs, analytics, and infrastructure.](architecture.png)

The API is the primary application boundary for user-facing actions, but it is not the only process that reads or writes the database. Analytics needs to process batches of data, and migrations and seeds need controlled operational access. Keeping those paths explicit makes the architecture more honest and lets each workload use an appropriate execution model.

## 2. Technology Stack

### Web application

The web client is a TypeScript React application built with Vite. React Router handles navigation, TanStack Query manages server state and mutations, and Mantine supplies the component and layout primitives.

Authentication is handled in the browser through AWS Amplify. The client obtains a Cognito ID token and sends it with API requests. The web application also contains the product-level query and mutation logic for recipes, favorites, cooking activity, recommendations, and draft generation.

### API

The API is a Node.js and TypeScript service built with Fastify. It provides authenticated HTTP routes for recipes, drafts, recommendations, users, administration, and related product operations.

The API is divided into modules. Controllers translate HTTP requests into product actions, services hold workflow logic such as recipe generation, and repositories own database operations. This gives request handling, business behavior, and persistence different homes without requiring every feature to become a separate service.

Prisma provides the database client and schema tooling. The API uses PostgreSQL through Prisma's PostgreSQL adapter, with the database connection assembled from environment variables and secrets at runtime.

### Shared contracts

The `contracts` workspace contains TypeBox schemas and route definitions shared by the web and API. A contract describes a route's method, path, request parameters, request body, and possible responses.

On the API side, Fastify uses the schemas for request and response validation and TypeScript type inference. On the web side, `contractFetch` uses the same route definition to build URLs, serialize requests, attach the Cognito token, parse responses, and expose typed request and response values.

This is more than a collection of shared TypeScript types. The schemas also operate at runtime, which helps catch malformed requests and unexpected responses at the boundary between applications.

### Analytics

The analytics package is Python 3.12 code managed with `uv`. It uses SQLAlchemy and psycopg for database access, NumPy for numerical work, and scikit-learn for the current recommendation model experiments.

Analytics has two roles:

1. offline dataset generation and recommendation evaluation; and
2. a scheduled recommendation worker that computes and persists recommendations for users.

The production worker is packaged as a Docker image and runs as a container-based AWS Lambda function.

### Infrastructure

Infrastructure is written in TypeScript using AWS CDK. CDK synthesizes CloudFormation templates from application code, allowing networking, databases, compute, permissions, schedules, monitoring, and deployment outputs to be reviewed and changed alongside the application.

## 3. The Data Model

PostgreSQL is the durable system of record. Prisma's schema uses two PostgreSQL schemas to separate product data from analytics data while allowing them to relate to one another.

### Product data

The `dishcraft` schema contains the user-facing domain:

- `User` stores identity and application-level user state.
- `Recipe` stores normalized, durable recipe data.
- `RecipeDraft` stores flexible recipe-content snapshots and their lineage.
- `UserRecipeState` stores user-specific favorites, cooking counts, ratings, and timestamps.
- Ingredient, grocery, unit, equipment, and tag tables normalize reusable entities.
- Impersonation records support controlled administrative workflows.

The draft and recipe representations are intentionally different. A draft stores presentation-oriented recipe content as JSON, which makes successive generated or edited versions easy to preserve. A normalized recipe stores ingredients, equipment, and tags relationally so the rest of the product can query and reuse them.

The draft-to-recipe relationship preserves provenance. A normalized recipe points back to the draft that created it, while a draft's lineage and source pointers preserve the editing history that preceded it. The [recipe draft workflow](../recipe-draft-workflow/) article goes deeper into that model.

### Analytics data

The `analytics` schema contains recommendation-specific state:

- recipe dimensions and dimension values;
- recipe attributes used by the recommendation model;
- user affinity values used by the simulator and analysis;
- recommendation runs and their status;
- ranked recipe results for each run; and
- the most recent successful run for each user.

Recommendation results are persisted rather than calculated during every page request. This makes the user-facing API fast and gives each batch a durable run record that can be inspected when a computation succeeds or fails.

### Why PostgreSQL is shared

The shared database gives the analytics process direct access to the product facts it needs: recipes, user interaction state, draft-derived recipes, and recommendation metadata. It also avoids copying the entire product dataset into a separate warehouse while the application is still at an early stage.

The tradeoff is that analytics and the API share a schema boundary. Database changes therefore need coordination across Prisma models, analytics queries, seed data, and deployment jobs. The repository treats migrations and seed tasks as explicit deployment steps rather than hiding schema changes inside application startup.

## 4. The API’s Role—and Its Limits

The API is the main gateway for interactive product behavior. It authenticates requests, applies user visibility rules, validates inputs, invokes services, and returns contract-shaped responses.

For example, a web request to customize a recipe passes through the API, which:

1. verifies the Cognito token through the authentication hook;
2. resolves the application user;
3. checks that the source recipe or draft is available to that user;
4. runs the generation workflow;
5. validates the generated content; and
6. persists a new draft through a repository transaction.

The API also owns user-facing recipe operations such as favoriting, recording a cooked recipe, reading recommendations, and normalizing a draft into a recipe.

It is not, however, the sole user of the data model. Other controlled clients include:

- the recommendation worker, which reads product and analytics data and writes recommendation runs and ranked results;
- migration tasks, which apply Prisma migrations before a new application version is used;
- seed tasks, which populate or refresh controlled environments; and
- administrative and operational scripts, which interact with Cognito, CloudFormation, ECS, and database access paths.

This distinction is important. The API is the authority for interactive product behavior and authorization, while batch and operational processes have narrower, explicitly defined responsibilities. Not every process needs to make an HTTP request to the API simply to perform a scheduled computation or a deployment task.

## 5. Authentication and Data Access

The web application authenticates users through Cognito. The API verifies the bearer ID token against the configured Cognito user pool and client, then upserts the corresponding application user. Route modules can require authentication before executing product logic.

Authorization is enforced in application repositories and visibility queries. For example, an unpublished recipe is visible to its creator, while published recipes can be read by other users. Draft lookup is scoped to the authenticated user, and source recipes must satisfy the current visibility rules before a new draft can be created.

The application also supports controlled administrator impersonation for support and debugging. An administrator starts a time-limited impersonation session, and the web client sends that session identifier with subsequent requests. The API verifies that the session belongs to the authenticated administrator, has not expired or ended, and then evaluates user-scoped behavior as the target user while retaining the administrator as the actor.

The infrastructure reinforces those boundaries:

- the database is placed in isolated subnets and is not publicly accessible;
- security groups allow PostgreSQL traffic from the API, recommendation worker, and bastion paths rather than from the open internet;
- database and OpenAI credentials are injected through AWS Secrets Manager;
- the public API is reached through an HTTPS Application Load Balancer; and
- the production database has deletion protection enabled.

The architecture does not treat authentication as only a frontend concern. The API verifies tokens independently, and data access methods apply user-specific visibility and ownership rules close to the data they protect.

## 6. AWS Runtime Architecture

CDK composes the deployment from multiple stacks. The main resources are:

- **Network stack:** a stage-specific VPC, public and isolated subnets, security groups, and VPC endpoints for services such as ECR, CloudWatch Logs, Secrets Manager, and S3.
- **Database stack:** a private PostgreSQL RDS instance, generated credentials, backups, logs, and database alarms.
- **Authentication stack:** a Cognito user pool, web client, and administrator group.
- **Container registry stack:** ECR repositories for the API and recommendation worker images.
- **API stack:** an ECS Fargate service behind an HTTPS Application Load Balancer, with health checks and CloudWatch alarms.
- **API jobs stack:** Fargate task definitions for one-off database migration and seed operations.
- **Recommendation stack:** a container-based Lambda function in the VPC, an hourly EventBridge Scheduler rule, and recommendation alarms.
- **Monitoring stack:** a CloudWatch operations dashboard combining API, database, and recommendation signals.
- **Notifications stack:** an SNS topic used by alarms to notify operators.
- **GitHub Actions IAM stack:** the deployment role used by CI/CD through GitHub's AWS identity federation.

The API runs as a long-lived service because it handles interactive traffic. The recommendation worker runs as a scheduled batch because recommendation computation does not need to occupy the request path. Migrations and seeds run as one-off ECS tasks so the API container can start safely without making every restart mutate the database.

## 7. Deployment Process

The deployment process separates validation, image creation, database preparation, and infrastructure rollout.

### Continuous integration

The CI workflow runs separate jobs for the web, API, infrastructure, and analytics packages. It installs locked dependencies, builds shared contracts, typechecks code, lints workspaces, runs web tests, runs API integration and end-to-end tests, and typechecks analytics with Pyright. Infrastructure typechecking and linting happen in CI, while CDK synthesis is part of the deployment workflow.

### Container images

The API Dockerfile is a multi-stage build. It installs the workspace dependencies, builds the contracts package, generates the Prisma client, compiles the API, and produces separate runtime targets for:

- the long-lived API process;
- database migration tasks; and
- database seed tasks.

The analytics Dockerfile packages the Python worker and its locked dependencies into a Lambda-compatible image. Both images are pushed to ECR with tags resolved by the deployment workflow.

### Infrastructure rollout

On a staging deployment, the GitHub Actions workflow:

1. detects whether API or recommendation code changed;
2. resolves image tags and builds only the images that need rebuilding;
3. pushes changed images to ECR;
4. deploys the API jobs stack with the new image tags;
5. runs the database migration task;
6. runs the seed task after migrations succeed;
7. synthesizes and deploys changed CDK stacks; and
8. runs API smoke tests against the deployed health and readiness endpoints.

The workflow uses an AWS role assumed through GitHub's OIDC integration rather than storing long-lived AWS access keys in the repository. The infrastructure code supports separate `staging` and `prod` stage values, allowing resource names, capacities, log retention, and destructive behavior to vary by environment.

The web application is deployed through AWS Amplify. Its build configuration installs the monorepo dependencies, builds the shared contracts, builds the web workspace, runs the web linter, and publishes `web/dist`.

## 8. Testing Strategy

Testing is organized around the boundaries where failures would be most expensive.

### API integration tests

API module tests run against PostgreSQL and exercise routes through Fastify's injection mechanism. They cover successful behavior, validation failures, domain errors, authentication, data visibility, recipe state, draft lineage, and normalization. The API also has a golden-path end-to-end test that exercises the application more broadly.

The test helpers reset selected tables between suites, seed known users and recipes, and construct the same application with test logging. This keeps tests close to the real route and repository behavior without requiring a network server for every request.

### Web tests

The web workspace uses Vitest and Testing Library support. Shared setup supplies browser APIs such as `matchMedia` and `ResizeObserver` that UI components expect during tests.

### Contract and type checks

Contracts are built before dependent workspaces are typechecked. This ensures the web and API compile against the same generated contract package. TypeScript checks, ESLint, and dead-code analysis provide additional static feedback.

### AI and recommendation evaluations

The recipe-generation area includes fixture-driven evaluations for accepted and refused prompts. The recommendation package includes reproducible comparisons between the transparent baseline and the current ML approach using simulated users and held-out evaluation data.

These are not substitutes for integration tests. They answer different questions: integration tests ask whether the system behaves correctly at its boundaries, while evaluations ask whether an AI or ranking strategy is useful under defined assumptions.

## 9. Code Quality and Maintainability

Several practices keep a growing monorepo manageable:

- TypeScript workspaces share a single dependency installation and a common contract package.
- TypeBox schemas provide runtime validation alongside compile-time types.
- ESLint runs per workspace and supports staged-file checks through Husky and lint-staged.
- Knip is configured for dead-code and unused-export analysis.
- Prisma migrations make database evolution explicit.
- Docker builds verify that the application can run from a production-style image rather than only from a local development process.
- Health and readiness endpoints distinguish “the process is alive” from “the API can reach its database.”
- CloudWatch alarms and SNS notifications make operational failures visible after deployment.

The goal is not to eliminate all complexity. It is to make the important forms of complexity visible: shared contracts for API drift, transactions for multi-table writes, one-off tasks for schema changes, and separate evaluation paths for probabilistic features.

## 10. Architectural Tradeoffs

Dishcraft deliberately favors a modular monolith over a collection of small services. The API has clear internal module boundaries, but recipe, draft, user state, and administration still share a deployable service and database. That keeps the product easier to evolve while the domain is still changing.

Analytics is separated because its workload and runtime are different, not because every domain module needs its own service. It can use Python's data and ML ecosystem, run on a schedule, and write durable recommendation results without adding latency to interactive requests.

The shared PostgreSQL design favors consistency and development speed, with the cost of coordinating schema changes across the API, analytics, and operational jobs. The CDK and CI/CD layers make that coordination explicit by deploying migrations and dependent runtime changes in a known order.

The resulting architecture is intentionally practical: a single product surface for users, strong boundaries around data and contracts, specialized batch computation where it helps, and infrastructure that can be reproduced from code.
