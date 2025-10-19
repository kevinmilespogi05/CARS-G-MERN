const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Cars-G Development Environment...\n');

// Start the API server
console.log('📡 Starting API Server...');
const serverProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'pipe',
  shell: true
});

serverProcess.stdout.on('data', (data) => {
  console.log(`[API] ${data.toString().trim()}`);
});

serverProcess.stderr.on('data', (data) => {
  console.error(`[API ERROR] ${data.toString().trim()}`);
});

// Start the frontend
console.log('🌐 Starting Frontend...');
const frontendProcess = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname),
  stdio: 'pipe',
  shell: true
});

frontendProcess.stdout.on('data', (data) => {
  console.log(`[FRONTEND] ${data.toString().trim()}`);
});

frontendProcess.stderr.on('data', (data) => {
  console.error(`[FRONTEND ERROR] ${data.toString().trim()}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development environment...');
  serverProcess.kill();
  frontendProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development environment...');
  serverProcess.kill();
  frontendProcess.kill();
  process.exit(0);
});

// Wait a moment for processes to start
setTimeout(() => {
  console.log('\n✅ Development environment started!');
  console.log('📡 API Server: http://localhost:3001');
  console.log('🌐 Frontend: http://localhost:5173');
  console.log('\n💡 Press Ctrl+C to stop both servers\n');
}, 2000);
