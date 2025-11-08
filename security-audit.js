/**
 * Security Audit Script
 * Run this before deploying to ensure no secrets are exposed
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 Running Security Audit...\n');

let issues = 0;
let warnings = 0;

// Check if .env files are in .gitignore
console.log('1. Checking .gitignore...');
const gitignorePath = path.join(__dirname, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf8');
  const requiredEntries = [
    '.env',
    'server/.env',
    'client/.env',
    'node_modules',
    'logs/',
    'server/logs/'
  ];
  
  requiredEntries.forEach(entry => {
    if (gitignore.includes(entry)) {
      console.log(`   ✅ ${entry} is in .gitignore`);
    } else {
      console.log(`   ❌ ${entry} is NOT in .gitignore`);
      issues++;
    }
  });
} else {
  console.log('   ❌ .gitignore file not found!');
  issues++;
}

// Check if .env.example files exist
console.log('\n2. Checking .env.example files...');
const exampleFiles = [
  'server/.env.example',
  'client/.env.example'
];

exampleFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ ${file} exists`);
  } else {
    console.log(`   ⚠️  ${file} does not exist`);
    warnings++;
  }
});

// Check if actual .env files exist but are NOT tracked
console.log('\n3. Checking .env files (should exist but NOT be tracked)...');
const envFiles = [
  'server/.env',
  'client/.env'
];

envFiles.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    console.log(`   ✅ ${file} exists (good for local development)`);
    console.log(`      ⚠️  Ensure this is NOT committed to Git!`);
  } else {
    console.log(`   ⚠️  ${file} does not exist (create from .env.example)`);
    warnings++;
  }
});

// Check for hardcoded secrets in code
console.log('\n4. Scanning for hardcoded secrets...');
const filesToCheck = [
  'server/server.js',
  'server/auth.js',
  'server/config/database.js'
];

const dangerousPatterns = [
  /mongodb\+srv:\/\/[^:]+:[^@]+@/i, // MongoDB connection with password
  /[a-zA-Z0-9]{32,}/g, // Potential API keys (32+ chars)
  /sk_live_[a-zA-Z0-9]+/g, // Stripe live keys
  /pk_live_[a-zA-Z0-9]+/g, // Stripe live keys
];

filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Check for process.env usage (good)
    const envUsage = (content.match(/process\.env\.[A-Z_]+/g) || []).length;
    console.log(`   ✅ ${file}: ${envUsage} environment variables used`);
    
    // Check for potential hardcoded secrets (bad)
    dangerousPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        // Exclude common false positives
        const realMatches = matches.filter(m => 
          !m.includes('YOUR_') &&
          !m.includes('your-') &&
          !m.includes('example') &&
          !m.includes('change-in-production')
        );
        
        if (realMatches.length > 0) {
          console.log(`   ⚠️  ${file}: Potential hardcoded secret found!`);
          console.log(`      Pattern: ${pattern}`);
          warnings++;
        }
      }
    });
  }
});

// Check package.json for exposed secrets
console.log('\n5. Checking package.json files...');
['server/package.json', 'client/package.json', 'package.json'].forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const pkg = JSON.parse(content);
    
    if (pkg.config || pkg.env) {
      console.log(`   ⚠️  ${file} contains config/env section - verify no secrets`);
      warnings++;
    } else {
      console.log(`   ✅ ${file} looks clean`);
    }
  }
});

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 SECURITY AUDIT SUMMARY');
console.log('='.repeat(50));
console.log(`Issues: ${issues}`);
console.log(`Warnings: ${warnings}`);

if (issues === 0 && warnings === 0) {
  console.log('\n✅ PASSED: No security issues found!');
  console.log('✅ Your repository is safe to push to GitHub');
} else if (issues === 0) {
  console.log('\n⚠️  PASSED WITH WARNINGS: Some items need attention');
  console.log('Review warnings above before deploying');
} else {
  console.log('\n❌ FAILED: Critical security issues found!');
  console.log('❌ DO NOT push to GitHub until issues are resolved');
  process.exit(1);
}

console.log('\n🔒 Security audit complete!');
