const { execSync } = require('child_process');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt the user for an answer, does not move on until they enter a valid answer
const getUserAnswer = async (question = 'Please use a suggested answer: ') => {
  const answer = await new Promise(resolve => rl.question(question, answer => resolve(answer)));
  if (answer == 'yes' || answer == 'no') return answer;
  return getUserAnswer();
};

const lintJs = (fix = false) => {
  const command = `npx eslint src/js/*.js src/js/**/*.js ${fix ? '--fix' : ''}`;
  console.log(`\nLinting JS ${fix ? 'with' : 'without'} auto-fix...`);
  try {
    execSync(command, { encoding: 'utf8',
      stdio: 'inherit' });
  } catch (error) {
    console.log('JS linting finished, remaining issues above.\n');
  }
};

const lintLiquid = (fix = false) => {
  const command = `shopify theme check ${fix ? '--auto-correct' : ''}`;
  console.log(`\nLinting Liquid ${fix ? 'with' : 'without'} auto-fix...`);
  try {
    execSync(command, { encoding: 'utf8',
      stdio: 'inherit' });
  } catch (error) {
    console.log('\nLiquid linting finished, remaining issues above.\n');
  }
};

const start = async () => {

  // Ask if the user wants to lint js files
  const jsAnswer = await getUserAnswer('\nDo you want to lint js files? (yes/no) ');
  if (jsAnswer === 'yes') {
    // Ask if the user would like the linter to apply automatic fixes
    const jsFixAnswer = await getUserAnswer('Do you want the linter to apply automatic fixes? (yes/no) ');
    lintJs(jsFixAnswer === 'yes');
  }

  // Ask if the user wants to lint liquid files
  const liquidAnswer = await getUserAnswer('\nDo you want to lint liquid files? (yes/no) ');
  if (liquidAnswer === 'yes') {
    // Ask if the user would like the linter to apply automatic fixes
    const liquidFixAnswer = await getUserAnswer('Do you want the linter to apply automatic fixes? (yes/no) ');
    lintLiquid(liquidFixAnswer === 'yes');
  }

  // Exit
  rl.close();
  process.exit(0);

};

start();