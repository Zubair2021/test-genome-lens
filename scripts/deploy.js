#!/usr/bin/env node
import { execSync } from 'child_process'
import { existsSync } from 'fs'

console.log('🚀 Deploying GenomeLens to GitHub Pages...\n')

// Check if dist folder exists
if (!existsSync('./dist')) {
  console.error('❌ Error: dist folder not found. Run `npm run build` first.')
  process.exit(1)
}

try {
  // Initialize gh-pages branch if it doesn't exist
  console.log('📦 Preparing deployment...')
  
  // Deploy using gh-pages
  execSync('npx gh-pages -d dist', { stdio: 'inherit' })
  
  console.log('\n✅ Deployment successful!')
  console.log('🌐 Your app will be available at your GitHub Pages URL')
} catch (error) {
  console.error('\n❌ Deployment failed:', error.message)
  process.exit(1)
}




