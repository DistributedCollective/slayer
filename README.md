# Sovryn Layer

Monorepo for Sovryn Layer frontend app and indexer.

## Development

Requirements:

- node@24.8
- pnpm@10
- docker compose (for indexer)

Project uses [nx](https://nx.dev/getting-started/intro) for workspace management.

### Starting project

#### Running entire stack

To run web-app and indexer:

1. `pnpm install` - install node modules
2. Adjust `.env.local` in `apps/web-app` (optional)
3. Adjust `.env` in `apps/indexer` (optional)
4. `pnpm docker:indexer` - spin off redis and postgresql for the indexer (optional)
5. `pnpm serve` - run both web-app and indexer in development mode

#### Frontend only

1. `pnpm install`
2. Adjust `.env.local` in `apps/web-app` for `VITE_API_BASE` to include deployed indexer url.
3. `pnpm serve:web` - runs web-app in development mode.

#### Indexer only

1. `pnpm install`
2. Adjust `.env` in `apps/indexer` (optional)
3. `pnpm docker:indexer` - spin off redis and postgresql for the indexer (optional)
4. `pnpm serve:indexer` - run indexer in development mode.

### Working with it

#### Adding and removing npm dependencies

To add new npm dependency to the app or package, use `--filter` flag when running `pnpm` to select to which project command should apply:

`pnpm add lodash --filter web-app` - installs lodash for web-app app.

`pnpm remove lodash --filter sdk` - removes lodash from sdk package.

`pnpm add typescript -w -D` - installs typescript to the workspace root as dev dependency.

#### Indexer

Indexer uses [drizzle-orm](https://orm.drizzle.team/docs/kit-overview) to work with migrations.
You may run drizzle commands on root folder of monorepo and it will be forwarded to indexer, ex: `pnpm drizzle-kit studio`

#### Packages

`packages` folder contains libraries that may be shared between projects. To create new packages, consult (nx documentation)[https://nx.dev/features/generate-code].
Once new package is generated, you may use that package in an app by adding it in the apps package.json file.
For example, if package generated is named as `@sovryn/my-pgk` and want to use it in the indexer, add `"@sovryn/my-pgk": "workspace:*"` to indexers package.json dependencies and run `pnpm install` on repositories root. Then `@sovryn/my-pgk` can be imported in the code normally.

`packages/slayer-shared` - MUST contain only code which can run in both browser and node environment and is dedicated for helper functions, interfaces and typings that should be shared between web-app and indexer.

`packages/sdk` - is just a placeholder right now. Likely to hold npm package with helpers to use sovryn layer for other projects in the future.
