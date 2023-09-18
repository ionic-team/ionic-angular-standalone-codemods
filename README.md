# Ionic Angular Standalone Codemods

These code mods will update your application to use the new standalone components. It is recommended you run the CLI on a clean branch of your application. This project is experimental and developers should manually test their application after running any migrations and review all changes.

If you run into any issues while using this project, please open an issue on this repository. If you are unable to provide a reproduction project, please provide relevant code snippets to help us reproduce the issue.

**This repository is in active development and is not ready for use. Please check back soon!**

## Usage

```bash
npx @ionic/angular-standalone-codemods
# Follow the prompts
# - Dry run or not
# - Path to your Angular project (defaults to current directory)
```

## Developing

1. Clone this repo
2. Run `pnpm install`
3. Run `pnpm run dev` to start the dev server, this will watch for changes and rebuild the project
4. Run `pnpm run start --filter=cli` to start the CLI and test the code mods
