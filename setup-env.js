#!/usr/bin/env node

/**
 * CleanCycle - Environment Setup Helper
 * Powered by Daniel Soos 2025
 * 
 * This script helps you set up your .env.local file
 */

const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🧺 CleanCycle - Environment Setup');
console.log('Powered by Daniel Soos 2025\n');
console.log('This script will help you create your .env.local file.\n');
console.log('You can find these values in your Supabase Dashboard:');
console.log('Settings > API\n');

const questions = [
  {
    key: 'NEXT_PUBLIC_SUPABASE_URL',
    prompt: 'Enter your Supabase Project URL (e.g., https://abcdefgh.supabase.co): '
  },
  {
    key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    prompt: 'Enter your Supabase Anon Key (starts with eyJhbGciOi...): '
  },
  {
    key: 'SUPABASE_SERVICE_ROLE_KEY',
    prompt: 'Enter your Supabase Service Role Key (starts with eyJhbGciOi...): '
  }
];

const answers = {};
let currentQuestion = 0;

function askQuestion() {
  if (currentQuestion >= questions.length) {
    createEnvFile();
    return;
  }

  const question = questions[currentQuestion];
  rl.question(question.prompt, (answer) => {
    if (!answer.trim()) {
      console.log('❌ This field is required. Please try again.\n');
      askQuestion();
      return;
    }

    answers[question.key] = answer.trim();
    currentQuestion++;
    askQuestion();
  });
}

function createEnvFile() {
  const envContent = Object.entries(answers)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync('.env.local', envContent);
  
  console.log('\n✅ Success! Your .env.local file has been created.\n');
  console.log('Next steps:');
  console.log('1. Make sure you have run the SQL migration in Supabase');
  console.log('2. Set up Google OAuth in Supabase Dashboard');
  console.log('3. Run: npm run dev');
  console.log('4. Open: http://localhost:3000\n');
  console.log('For detailed instructions, see NEXT_STEPS.md\n');
  console.log('Powered by Daniel Soos 2025 🚀\n');
  
  rl.close();
}

// Check if .env.local already exists
if (fs.existsSync('.env.local')) {
  rl.question('\n⚠️  .env.local already exists. Do you want to overwrite it? (y/N): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      console.log('\n');
      askQuestion();
    } else {
      console.log('\n❌ Setup cancelled. Your existing .env.local file was not modified.\n');
      rl.close();
    }
  });
} else {
  askQuestion();
}

