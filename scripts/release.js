const { execSync } = require('child_process');
const fs = require('fs');
const exec = require('./utils/verboseExec');
const incrementVersion = require('./utils/semver-increment');

const { CI_PROJECT_ID, CI_API_V4_URL, CI_PROJECT_URL, CI_PROJECT_NAME, PA_TOKEN_AUTH } = process.env;

const commitType = {
  feat: {
    title: 'Features',
    commits: [],
  },
  fix: {
    title: 'Bug Fixes',
    commits: [],
  },
  chore: {
    title: 'Chores',
    commits: [],
  },
  docs: {
    title: 'Documentations',
    commits: [],
  },
  style: {
    title: 'Code Stylings',
    commits: [],
  },
  perf: {
    title: 'Performance Improvements',
    commits: [],
  },
  refactor: {
    title: 'Refactor',
    commits: [],
  },
  revert: {
    title: 'Reverts',
    commits: [],
  },
  ci: {
    title: 'Continuous Integration',
    commits: [],
  },
  test: {
    title: 'Tests',
    commits: [],
  },
  build: {
    title: 'Build System',
    commits: [],
  },
};

(function() {
  const latestTagSplit = execSync('git describe --always')
    .toString('utf-8')
    .split(CI_PROJECT_NAME);

  const hasPublishedRelease = latestTagSplit.length > 1;

  const latestTag = (hasPublishedRelease
    ? `${CI_PROJECT_NAME}${latestTagSplit[1].split('-')[0]}`
    : `${latestTagSplit[0]}`
  ).replace(/\n/g, '');

  const output = execSync(
    `git log ${latestTag}${hasPublishedRelease ? '..HEAD' : ''} --format=%B%H----DELIMITER----`,
  ).toString('utf-8');

  const commitsArray = output
    .split('----DELIMITER----\n')
    .map(commit => {
      const [message, sha] = commit.split('\n');

      return { sha, message };
    })
    .filter(commit => Boolean(commit.sha));

  if (!commitsArray.length) {
    console.info("[Info] There is no commit this week, therefore skipping this week's release...");
    process.exit(0);
  }

  const currentChangelog = fs.readFileSync('./CHANGELOG.md', 'utf-8');
  const packageJson = require('../package.json');
  const newVersion = incrementVersion([0, 1, 0], packageJson.version);

  const changelogHeader = `# Version ${newVersion} (${new Date().toISOString().split('T')[0]})\n\n`;
  let newChangelog = changelogHeader;

  commitsArray.forEach(commit => {
    Object.keys(commitType).forEach(key => {
      if (commit.message.startsWith(`${key}: `)) {
        const str = `* ${commit.message.replace(`${key}: `, '')} ([${commit.sha.substring(
          0,
          6,
        )}](${CI_PROJECT_URL}/commit/${commit.sha}))\n`;

        commitType[key].commits.push(str);
      }
    });
  });

  // Append the new changelog text by defined title & commits
  Object.keys(commitType).forEach(key => {
    const currentType = commitType[key];

    if (currentType.commits.length) {
      newChangelog += `## ${currentType.title}\n`;
      currentType.commits.forEach(feature => {
        newChangelog += feature;
      });
      newChangelog += '\n';
    }
  });

  if (newChangelog === changelogHeader) {
    console.info('[Info] It seems there is no new changelog content added, but somehow commits array is not empty.');
    console.info(commitsArray);

    process.exit(0);
  }

  const newTag = `${CI_PROJECT_NAME}@${newVersion}`;

  // prepend the newChangelog to the current one
  fs.writeFileSync('./CHANGELOG.md', `${newChangelog}${currentChangelog}`);

  // update package.json
  fs.writeFileSync('./package.json', JSON.stringify({ ...packageJson, version: String(newVersion) }, null, 2));

  // create a new commit
  exec('git add .');
  exec(`HUSKY_SKIP_HOOKS=true git commit -m "chore(release): [Repo Title] Weekly Release - ${newVersion}"`);

  // tag the commit
  exec(`git tag -a ${newTag} -m "Release v${newVersion}"`);

  // push the commit tag
  exec('git push --tags -o ci.skip && git push origin master');

  const releaseNotes = {
    name: `Release - ${newTag}`,
    tag_name: newTag,
    description: newChangelog.replace(/'/g, ''),
  };

  // create the gitlab release
  exec(
    `curl --header 'Content-Type: application/json' --header "PRIVATE-TOKEN: ${PA_TOKEN_AUTH}" --data '${JSON.stringify(
      releaseNotes,
    )}' --request POST ${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/releases`,
  );
})();
