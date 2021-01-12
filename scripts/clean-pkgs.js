/** Adapted from gatsby/scripts/clear-package-dir */

const ignore = require(`ignore`)
const fs = require(`fs-extra`)
const yargs = require(`yargs`)
const chalk = require(`chalk`)
const collectUpdates = require(`@lerna/collect-updates`)
const PackageGraph = require(`@lerna/package-graph`)
const Project = require(`@lerna/project`)
const PromptUtilities = require(`@lerna/prompt`)
const _ = require(`lodash`)
const path = require(`path`)
const packlist = require(`npm-packlist`)
const { execSync } = require(`child_process`)

let argv = yargs
  .command(
    `*`,
    `Clear previously built and potentially stale files in packages`,
  )
  .option(`dry-run`, {
    default: false,
    describe: `Don't delete files - just show what would be deleted`,
    type: 'boolean'
  })
  .option(`verbose`, {
    default: false,
    describe: `Show files that would be bundled and mark files that will be deleted`,
    type: 'boolean'
  })
  .option(`force`, {
    default: false,
    describe: `Force deletion of files without prompting user to confirm`,
    type: 'boolean'
  }).argv

const verbose = argv[`dry-run`] || argv[`verbose`];

const buildIgnoreArray = str =>
  str
    .split(`\n`)
    .filter(line => {
      // skip empty lines and comments
      if (!line || line[0] === `#`) {
        return false
      }

      return true
    })
    .reduce((acc, item) => {
      acc.push(item)

      // add "<directory>/**" glob as ignore package need that to
      // properly ignore entries like "node_modules"
      if (!/\*\*$/.test(item)) {
        acc.push(`${item}/**`)
      }
      return acc
    }, [])

const getListOfFilesToClear = async ({ location, name }) => {
  let gitignore = []
  try {
    gitignore = buildIgnoreArray(
      fs.readFileSync(path.join(location, `.gitignore`), `utf-8`)
    )
  } catch {
    //? potenially not all packages have .gitignore
  } finally {
    const notTrackedFiles = execSync(
      `git ls-files --others --exclude-standard`,
      {
        cwd: location,
      }
    )
      .toString()
      .split(`\n`)

    gitignore = gitignore.concat(notTrackedFiles)
  }

  const result = await packlist({ path: location })

  const ig = ignore().add(gitignore)

  if (verbose) {
    console.log(`Files that will be packed for ${chalk.bold(name)}:`)
  }

  const filesToDelete = result
    .filter(file => {
      const willBeDeleted = ig.ignores(file)

      if (verbose) {
        console.log(
          `[ ${
            willBeDeleted ? chalk.red(` X `) : chalk.green(` - `)
          } ] ${path.posix.join(file)}`
        )
      }

      return willBeDeleted
    })
    .map(file => path.join(location, file))

  return filesToDelete
}

const run = async () => {
  try {
    const project = new Project(process.cwd());

    const packages = await project.getPackages();
    const packageGraph = new PackageGraph(packages);

    const changed = collectUpdates(
      packageGraph.rawPackageList,
      packageGraph,
      { cwd: process.cwd() },
      {
        ...project.config,
        loglevel: `silent`,
        bump: argv.bump,
      }
    );

    const filesToDelete = _.flatten(
      await Promise.all(changed.map(getListOfFilesToClear))
    );

    if (!argv[`dry-run`] && filesToDelete.length > 0) {
      if (
        argv[`force`] ||
        (await PromptUtilities.confirm(
          `Are you sure you want to delete those files?`
        ))
      ) {
        filesToDelete.forEach(file => {
          fs.removeSync(file);
        });
      } else {
        console.log(`
        ${chalk.red(`Stopping clean`)}:
        If the file list included files you don't want to be deleted, it's likely because they are untracked.
        Try committing your changes and running clean again.
        `);
        
        process.exit(1);
      }
    }
  } catch {
    // if no packages are marked as changed, lerna will exit with non-zero
  }
}

run();