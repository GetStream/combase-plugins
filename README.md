### Contributing
Plugins are, at their core, a mapping of event names to methods.
// TODO: Finish write up once finalized
// TODO: Link to an example plugin repo

All plugins must include the following:
```
- package.json
- README.md
- about.md
- combase.config.js
- src/
-- index.js
```

Anything with the `src` directory of the plugin will be compiled into the root of the package when the `build` `watch` and `deploy` scripts are run.

> On `clean`, any files that were compiled from `src` will be removed form the root.
> Any other existing files, including MD or JS files that we're _not_ originally in `src` will remain intact.

Every plugin should define it's structure and available behaviors in `combase.config.json` - this ultimately becomes a GraphQL Object Type in the Combase API so users can query, filter and configure your plugin.

#### Workspace
This monorepo uses Lerna and Yarn Workspaces.

Lerna allows us to run any commands in parallel across all of our packages, and also easily deploy multiple packages with one command.

#### Commands
All commands below should be ran from the workspace root unless explicitly mentioned.

**All Packages**
`run`
```bash
yarn build
```

`watch`
```bash
yarn watch
```

**A single package** (where x === the plugin name)
`run`
```bash
yarn workspace @combase/plugin-x build:run
```

`watch`
```bash
yarn  wrkspace @combase/plugin-x build:watch
```

**Clean all built files**
```bash
yarn clean
```

**Clean built files from a single package**
```bash
yarn workspace @compase/plugin-x build:clean
```
---

- Don't need headings in `about.md` - the page will generate a header for you. Subheadings within the document are fine, `<h*>` elements at the top can look strange. Don't use `h1` anywhere.
