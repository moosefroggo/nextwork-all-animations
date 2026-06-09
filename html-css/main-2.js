// main.js - Loader and Router Entry Point
const urlParams = new URLSearchParams(window.location.search);
const codeParam = urlParams.get('code');

if (codeParam === 'copy' || codeParam === 'copy1') {
  setupAppContainer();
  import('./main copy.js');
} else if (codeParam === 'copy2' || codeParam === 'platforms') {
  setupAppContainer();
  import('./main copy 2.js');
} else {
  // Default: Load the new 3D IDE Workspace simulator
  import('./src/ide-workspace.js');
}

function setupAppContainer() {
  // Hide the interactive dashboard sidebar
  const dashboard = document.getElementById('dashboard-container');
  if (dashboard) {
    dashboard.style.display = 'none';
  }
  
  // Create the standard #app container expected by the old versions
  const appDiv = document.createElement('div');
  appDiv.id = 'app';
  appDiv.style.width = '100vw';
  appDiv.style.height = '100vh';
  appDiv.style.position = 'absolute';
  appDiv.style.top = '0';
  appDiv.style.left = '0';
  appDiv.style.zIndex = '1';
  document.body.appendChild(appDiv);
  
  // Adjust body background color to match the dark color of the platforms scene
  document.body.style.backgroundColor = '#14161a';
}
