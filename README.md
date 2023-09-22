# Ionic Angular Standalone Codemods

> [!WARNING]
> This project is experimental. Review all changes before committing them to your project.

Code mods to migrate an Ionic Angular application to use the new standalone components.

If you run into any issues while using this project, please open an issue on this repository. If you are unable to provide a reproduction project, please provide relevant code snippets to help us reproduce the issue.

**This repository is in active development and is not intended for production use. Check back soon!**

## Usage

```bash
npx @ionic/angular-standalone-codemods
# Follow the prompts
# - Dry run or not
# - Path to your Angular project (defaults to current directory)
```

## Developing

1. Clone this repository.
2. Run `pnpm install` to install dependencies
3. Run `pnpm run dev` to start the dev server, this will watch for changes and rebuild the project
4. Run `pnpm run start --filter=cli` to start the CLI and test the code mods

### Testing

This project uses [Vitest](https://vitest.dev/) for unit testing.

| Command               | Description                 |
| --------------------- | --------------------------- |
| `pnpm run test`       | Run all tests               |
| `pnpm run test:watch` | Run all tests in watch mode |

### Formatting

This project uses [Prettier](https://prettier.io/) for code formatting.

Run `pnpm run format` to format all files in the project.
