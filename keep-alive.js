/**
 * Keep-Alive Pinger for Render Free Tier
 * 
 * Render free tier spins down after 15 minutes of inactivity.
 * This script sends a ping every 10 minutes to keep it alive.
 * 
 * FREE services that can ping your backend:
 * 
 * 1. cron-job.org (Recommended)
 *    - Go to https://cron-job.org
 *    - Create free account
 *    - Add job: GET https://campus-bites-apiii.onrender.com/
 *    - Schedule: Every 10 minutes
 * 
 * 2. UptimeRobot (Alternative)
 *    - Go to https://uptimerobot.com
 *    - Create free account
 *    - Add monitor: HTTP(S)
 *    - URL: https://campus-bites-apiii.onrender.com/
 *    - Interval: 5 minutes
 * 
 * 3. Betterstack (Alternative)
 *    - Go to https://betterstack.com
 *    - Free uptime monitoring
 *    - Add your Render URL
 * 
 * This is a temporary fix. For permanent solution, deploy to:
 * - Koyeb (free, always-on)
 * - Fly.io (free, always-on)
 * - Railway ($5/mo free credit)
 */

console.log('Backend keep-alive setup instructions:');
console.log('========================================');
console.log('');
console.log('Your backend URL: https://campus-bites-apiii.onrender.com/');
console.log('');
console.log('Step 1: Go to https://cron-job.org');
console.log('Step 2: Create a free account');
console.log('Step 3: Create a new job:');
console.log('   - URL: https://campus-bites-apiii.onrender.com/');
console.log('   - Method: GET');
console.log('   - Schedule: Every 10 minutes');
console.log('Step 4: Enable the job');
console.log('');
console.log('This keeps your Render backend alive 24/7 for free.');
