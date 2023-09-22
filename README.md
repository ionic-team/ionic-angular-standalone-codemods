<p align="center">
  <a href="#">
    <img alt="Ionic" src="https://github.com/ionic-team/ionic-angular-standalone-codemods/blob/main/.github/assets/logo.png?raw=true" width="60" />
  </a>
</p>

<h1 align="center">
  Ionic Angular Standalone Codemods
</h1>

<p align="center">
Code mods to migrate an Ionic Angular application to use the new standalone components.
</p>

<p align="center">
  <a href="https://github.com/ionic-team/ionic-angular-standalone-codemods/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Ionic Angular Standalone Codemods is released under the MIT license." />
  </a>
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs welcome!" />
  <a href="https://twitter.com/Ionicframework">
    <img src="https://img.shields.io/twitter/follow/ionicframework.svg?label=Follow%20@IonicFramework" alt="Follow @IonicFramework">
  </a>
  <a href="https://ionic.link/discord">
    <img src="https://img.shields.io/discord/520266681499779082?color=7289DA&label=%23ionic&logo=discord&logoColor=white" alt="Official Ionic Discord" />
  </a>
</p>

<h2 align="center">
  <a href="https://blog.ionicframework.com/">Blog</a>
  <br />
  Community:
  <a href="https://ionic.link/discord">Discord</a>
  <span> · </span>
  <a href="https://forum.ionicframework.com/">Forums</a>
  <span> · </span>
  <a href="https://twitter.com/Ionicframework">Twitter</a>
</h2>

> [!WARNING]
> This project is experimental. Review all changes before committing them to your project.

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

### Additional Resources

- [Typescript AST Explorer](https://ts-ast-viewer.com/)
- [ts-morph API Docs](https://ts-morph.com/)
- [Clack Prompts Docs](https://github.com/natemoo-re/clack/tree/main/packages/prompts#readme)
