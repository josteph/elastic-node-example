const { execSync } = require('child_process');

module.exports = command => {
  execSync(command, { stdio: 'inherit', cwd: process.cwd() });
};
