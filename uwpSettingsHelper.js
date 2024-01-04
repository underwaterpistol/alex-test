// Get required modules
const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const Diff = require('diff');
const colours = require('colors');
const tempSettingsDir = path.join(__dirname, 'temp_settings');
const diffData = {
  diffsFound: 0,
  diffsFixed: 0,
  newFiles: 0
};

/**
 * Prompts the user for a yes/no answer. Will repeat the question if any other answer is given.
 * @param {String} question - The question to ask the user
 * @returns {String} - either "yes" or "no"
 */
const getUserAnswer = async (question = 'Please answer yes or no: ') => {
  const answer = await new Promise(resolve => rl.question(question, answer => resolve(answer)));
  if (answer === 'yes' || answer === 'no') return answer;
  return getUserAnswer();
};

/**
 * Makes a blank temp_settings directory,
 * Moves into that directory when check is complete.
 * @returns {void}
 */
const readyDirectory = () => {
  if (fs.existsSync(tempSettingsDir)) {
    fs.rmdirSync(tempSettingsDir, { recursive: true });
  }
  fs.mkdirSync(tempSettingsDir);
  process.chdir(tempSettingsDir);
};

/**
 * Generates the pull command for settings based on user input
 * @returns {Object} - The command to pull settings with, plus args to pass to the command
 * @example
 * {
 *  commandMain: 'shopify theme pull',
 *  commandArgs: ['--ignore=config/settings_data.json', '--nodelete']
 * } 
 */
const buildSettingsCommand = async () => {
  const commandMain = 'shopify theme pull';

  // Get options
  const commandArgs = ['--nodelete'];
  const settingsAnswer = await getUserAnswer('\nDo you need to sync settings_data? (yes/no) ');
  const templateAnswer = await getUserAnswer('Do you need to sync template settings? (yes/no) ');

  // If user doesn't want settings or templates, exit now
  if (settingsAnswer == 'no' && templateAnswer == 'no') return;

  // Add options to args
  commandArgs.push('-o');
  if (settingsAnswer == 'yes') commandArgs.push('config/settings_data.json');
  if (templateAnswer == 'yes') commandArgs.push('templates/');

  // Return the command with args
  return {
    commandMain,
    commandArgs
  };
};

/**
 * Pulls settings from Shopify into the current directory (which should be temp_settings)
 * @param {Object} commandParts - The command to pull settings with, plus args to pass to the command
 * @returns {void}
 */
const getSettings = commandParts => {
  const { commandMain, commandArgs } = commandParts;
  console.log(`\n\nDownloading settings with options: [${commandArgs.join(' | ')}]\n`);
  const command = `${commandMain} ${commandArgs.join(' ')}`;
  execSync(command, { encoding: 'utf8',
    stdio: 'inherit' });
};

/**
 * Makes sure the CLI version is high enough for --only flags
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

const diffFile = async (filePath, autoOverwrite = false) => {
  if (fs.existsSync(path.join(__dirname, filePath))) {
    const diff = Diff.diffLines(fs.readFileSync(path.join(tempSettingsDir, filePath), 'utf8'), fs.readFileSync(path.join(__dirname, filePath), 'utf8'));
    if (diff.some(part => part.added || part.removed)) {
      diffData.diffsFound++;
      console.log(`\n${filePath} was changed.`);
      if (autoOverwrite) {
        console.log(`Overwriting ${filePath}...`);
        diffData.diffsFixed++;
        fs.writeFileSync(path.join(__dirname, filePath), fs.readFileSync(path.join(tempSettingsDir, filePath), 'utf8'));
      } else {
        console.log('The following changes were detected:');
        diff.forEach(part => {
          const colour = part.added ? 'red' : part.removed ? 'green' : 'grey';
          console.log(colours[colour](part.value));
        });
        const answer = await getUserAnswer('Do you want to overwrite your file? (yes/no) ');
        if (answer == 'yes') {
          console.log(`Overwriting ${filePath}...\r`);
          diffData.diffsFixed++;
          fs.copyFileSync(path.join(tempSettingsDir, filePath), path.join(__dirname, filePath));
          console.log(`${filePath} overwritten.`);
        }
      }
    }
  } else {
    const noFileMessage = `${filePath} does not exist in your templates folder.`;
    console.log(`\n${colours.yellow(noFileMessage)}`);
    const answer = await getUserAnswer('Do you want to create it? (yes/no) ');
    if (answer == 'yes') {
      console.log(`Creating ${filePath}...\r`);
      diffData.newFiles++;
      fs.copyFileSync(path.join(tempSettingsDir, filePath), path.join(__dirname, filePath));
      const fileCreatedMessage = `${filePath} created.`;
      console.log(`${colours.green(fileCreatedMessage)}`);
    }
  }
};

const main = async () => {

  // Kick user if CLI version is too low
  checkVersion();

  // Get temp settings directory ready
  readyDirectory();

  // Get settings command and download settings
  const settingsCommand = await buildSettingsCommand();
  if (settingsCommand) getSettings(settingsCommand);

  // Diffcheck config/settings_data.json if present in temp_settings
  const settingsDownloaded = fs.existsSync(path.join(tempSettingsDir, 'config/settings_data.json'));
  if (settingsDownloaded) {
    console.log('\n\nChecking settings_data.json...');
    await diffFile('config/settings_data.json');
  }

  // Diffcheck all files in templates/ if directory is present in temp_settings
  const templatesDownloaded = fs.existsSync(path.join(tempSettingsDir, 'templates/'));
  if (templatesDownloaded) {
    console.log('\n\nChecking templates/...');
    const overwriteAll = await getUserAnswer('\n\nDo you want to automatically overwrite all templates? (yes/no) ');
    const files = fs.readdirSync(path.join(tempSettingsDir, 'templates/'));
    for (const file of files) {

      /*
       * If file is a directory, run diffcheck on all files in that directory,
       * otherwise just diffcheck the file
       */
      if (fs.lstatSync(path.join(tempSettingsDir, 'templates/', file)).isDirectory()) {
        const filesInDirectory = fs.readdirSync(path.join(tempSettingsDir, 'templates/', file));
        for (const fileInDirectory of filesInDirectory) {
          await diffFile(path.join('templates/', file, fileInDirectory), overwriteAll === 'yes');
        }
      } else {
        await diffFile(`templates/${file}`, overwriteAll === 'yes');
      }

    }
  }

  // Delete temp settings directory and exit
  fs.rmdirSync(tempSettingsDir, { recursive: true });
  console.log(`\n\n${colours.yellow(diffData.diffsFound)} files had changes. ${colours.yellow(diffData.diffsFixed)} files were overwritten. ${colours.green(diffData.newFiles)} files were created.\n\n`);
  process.exit(0);
};

main();
