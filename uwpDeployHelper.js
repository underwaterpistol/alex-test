const { execSync, spawnSync } = require('child_process');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const colours = require('colors');

// The default command - we will add options to this later
let deployCommand = 'shopify theme push';

// If the user is on Windows, the default command requires the executable file extension to work
if (process.platform === 'win32') {
  deployCommand = 'shopify.bat theme push';
}

/**
 * Makes sure the CLI version is high enough for --only/--ignore flags parser to support multiple occurrences without quotes
 * Exits and prompts for upgrade if not
 */
const checkVersion = () => {
  let shopifyCommand = 'shopify';

  // If the user is on Windows, spawnSync requires the executable file extension to work
  if (process.platform === 'win32') {
    shopifyCommand = 'shopify.bat';
  }
  const version = spawnSync(shopifyCommand, ['version'], { encoding: 'utf8',
    stdio: 'pipe' }).stdout.split('\n')[0];
  if (parseFloat(version) < 2.15) {
    console.log('\n\nShopify CLI version 2.15 or greater is required.\nPlease see upgrade instructions here: https://shopify.dev/apps/tools/cli/troubleshooting#upgrade-shopify-cli\n\n');
    process.exit(0);
  }
};

// Prompt the user for an answer, does not move on until they enter a valid answer
const getUserAnswer = async (question = 'Please answer yes or no: ') => {
  const answer = await new Promise(resolve => rl.question(question, answer => resolve(answer)));
  if (answer == 'yes' || answer == 'no') return answer;
  return getUserAnswer();
};

// Performs the actual deployment and optionally exits the process
const deploy = (exit = true) => {
  const commandParts = deployCommand.split(' ');
  const commandMain = commandParts[0];
  const commandArgs = commandParts.slice(1);
  console.log(`\n\nDeploying with options: [${commandArgs.slice(2).join(' | ')}]\n`);
  spawnSync(commandMain, commandArgs, { stdio: 'inherit' });
  console.log('\n\nDeploy complete.');
  console.log(`If you want to deploy with the same settings again use the following command:\n${colours.yellow(deployCommand)}\n`);
  if (exit) {
    rl.close();
    process.exit(0);
  }
};

const start = async () => {

  // Kick user if CLI version is too low
  checkVersion();

  // Ask if the user wants to build the theme first
  const buildAnswer = await getUserAnswer('Do you want to build the theme first? (yes/no) ');
  if (buildAnswer === 'yes') {
    console.log('Building...');
    execSync('npm run build', { encoding: 'utf8',
      stdio: 'ignore' });
    console.log('Build complete.\n\n');
  }

  // Ask the user if they want to deploy to a new theme
  const newThemeAnswer = await getUserAnswer('Do you want to deploy to a brand new theme? (yes/no) ');
  if (newThemeAnswer === 'yes') {
    deployCommand += ' --unpublished';
    deploy();
  }

  // Ask if the user wants to delete missing files from the remote theme
  const destructiveAnswer = await getUserAnswer('Do you want to delete missing files from the remote theme? (yes/no) ');
  if (destructiveAnswer === 'no') {
    deployCommand += ' --nodelete';
  }

  // Ask the user if they want to deploy settings_data
  const settingsAnswer = await getUserAnswer('Do you need to deploy settings_data? (yes/no) ');
  if (settingsAnswer === 'no') {
    deployCommand += ' --ignore config/settings_data.json';
  } else {
    // Ask the user if they want to deploy settings_data on it's own
    const onlySettingsAnswer = await getUserAnswer('Do you want to deploy settings_data only? (yes/no) ');
    if (onlySettingsAnswer === 'yes') {
      deployCommand += ' --only config/settings_data.json';
      deploy();
    }
  }

  // Ask the user if they want to deploy templates
  const templatesAnswer = await getUserAnswer('Do you need to deploy templates? (yes/no) ');
  if (templatesAnswer === 'no') {
    deployCommand += ' --ignore templates/';
  } else if (settingsAnswer == 'yes') {
    // Ask the user if they want to deploy settings and templates only
    const onlyTemplatesSettingsAnswer = await getUserAnswer('Do you want to deploy settings_data and templates only? (yes/no) ');
    if (onlyTemplatesSettingsAnswer === 'yes') {
      deployCommand += ' --only config/settings_data.json --only templates/';
      deploy();
    }
  } else {
    // Ask the user if they want to deploy templates on it's own
    const onlyTemplatesAnswer = await getUserAnswer('Do you want to deploy templates only? (yes/no) ');
    if (onlyTemplatesAnswer === 'yes') {
      deployCommand += ' --only templates/';
      deploy();
    }
  }

  // If we got this far, deploy now and exit
  deploy();
};

start();