/* eslint-disable no-eval */
const child = require('child_process');
const { promisify } = require('util');

const promisified = promisify(child.exec);

(async function() {
  const {
    CI_PROJECT_TITLE,
    CI_PROJECT_ID,
    CI_API_V4_URL,
    CI_PROJECT_URL,
    PA_TOKEN_AUTH: GITLAB_PA_TOKEN,
    PROD_BRANCH_NAME = 'prod',
  } = process.env;

  const bufferDiff = child.execSync(`git diff origin/master...origin/${PROD_BRANCH_NAME}`);

  const stringifiedDiff = bufferDiff.toString();

  if (stringifiedDiff) {
    console.info(`[INFO] Branch master has diff with ${PROD_BRANCH_NAME} is as following:\n`);
    console.log(stringifiedDiff);
  }

  // check if sync is necessary to master by checking how many commits prod is ahead
  // https://stackoverflow.com/questions/20433867/git-ahead-behind-info-between-master-and-branch
  const commitsAhead = child.execSync('git rev-list --right-only --count origin/master...origin/prod');

  const count = parseInt(commitsAhead, 10);

  if (!count) {
    console.info(
      `[INFO] origin/prod is ${count} commits ahead of origin/master, therefore there is no need to sync to master...`,
    );
    process.exit(0);

    return;
  }

  const postCMD = `curl --header 'Content-Type: application/json' --header "PRIVATE-TOKEN: ${GITLAB_PA_TOKEN}"`;

  const formattedDateString = new Date(Date.now()).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const mergeRequestTitle = `Daily Sync - ${formattedDateString}`;

  const createData = {
    id: CI_PROJECT_ID,
    target_branch: 'master',
    source_branch: 'prod',
    title: mergeRequestTitle,
    squash: true,
  };

  const { stdout } = await promisified(
    `${postCMD} --request POST ${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/merge_requests --data '${JSON.stringify(
      createData,
    )}'`,
  );

  const createOutput = JSON.parse(stdout);
  const createErrorMessage =
    (createOutput && createOutput.message && createOutput.message.length > 0 && createOutput.message[0]) || '';

  if (createErrorMessage.includes('Another open merge request already exists')) {
    console.error(`[ERROR] ${createErrorMessage}`);
    process.exit(1);
  }

  if (createOutput.has_conflicts) {
    console.error(`[ERROR] MR !${createOutput.iid} can't be merged automatically. Notifying to #web-deployment...`);

    const mergeRequestLink = `${CI_PROJECT_URL}/-/merge_requests/${createOutput.iid}`;

    const template = {
      text: `<!channel> Daily sync to master for ${CI_PROJECT_TITLE} failed!`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `<!channel> Daily sync to master for ${CI_PROJECT_TITLE} failed!\nPlease check <${mergeRequestLink}|${mergeRequestLink}> to resolve manually.`,
          },
        },
      ],
    };

    await promisified(
      `curl -X POST -H 'Content-type: application/json' --data '${JSON.stringify(
        template,
      )}' https://hooks.slack.com/services/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`,
    );

    process.exit(1);
  }

  const mergeData = {
    id: CI_PROJECT_ID,
    merge_request_iid: createOutput.iid,
    squash_commit_message: mergeRequestTitle,
    merge_when_pipeline_succeeds: true,
    squash: true,
  };

  const output = await promisified(
    `${postCMD} --request PUT ${CI_API_V4_URL}/projects/${CI_PROJECT_ID}/merge_requests/${
      createOutput.iid
    }/merge --data '${JSON.stringify(mergeData)}'`,
  );

  console.log(output);
})();
