import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  '.cache',
  '.replit',
  'replit.nix',
  '.upm',
  '.config',
  '.local',
  'package-lock.json',
  '/tmp',
  'script/create-github-repo.ts',
  'script/push-to-github.ts',
  'attached_assets',
];

function shouldIgnore(filePath: string): boolean {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function getAllFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(baseDir, fullPath);
    
    if (shouldIgnore(relativePath) || entry.name.startsWith('.')) continue;
    
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir));
    } else {
      files.push(relativePath);
    }
  }
  
  return files;
}

async function pushToGitHub() {
  const owner = 'Charlesmon82';
  const repo = 'BuffettMode';
  const branch = 'main';
  const commitMessage = 'Initial commit — BuffettMode: Value Investing System';
  
  try {
    const accessToken = await getAccessToken();
    const octokit = new Octokit({ auth: accessToken });
    
    console.log('Initializing repository with README...');
    
    // First, create a README to initialize the repo
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: 'README.md',
      message: 'Initialize repository',
      content: Buffer.from('# BuffettMode\n\nValue Investing System using Warren Buffett-style metrics.\n').toString('base64'),
    });
    
    console.log('Repository initialized. Now pushing all files...');
    
    // Get latest commit SHA
    const refResponse = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });
    const latestCommitSha = refResponse.data.object.sha;
    
    // Get the tree SHA
    const commitData = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: latestCommitSha,
    });
    
    // Get the files to push
    const workspaceDir = '/home/runner/workspace';
    const files = getAllFiles(workspaceDir);
    console.log(`Found ${files.length} files to push`);
    
    // Create blobs for each file
    const blobs: { path: string; sha: string; mode: string; type: string }[] = [];
    
    for (const file of files) {
      const filePath = path.join(workspaceDir, file);
      const content = fs.readFileSync(filePath);
      const base64Content = content.toString('base64');
      
      process.stdout.write(`\rCreating blob: ${file.padEnd(50)}`);
      const blobResponse = await octokit.git.createBlob({
        owner,
        repo,
        content: base64Content,
        encoding: 'base64',
      });
      
      blobs.push({
        path: file,
        sha: blobResponse.data.sha,
        mode: '100644',
        type: 'blob',
      });
    }
    
    console.log('\nCreating tree...');
    const treeResponse = await octokit.git.createTree({
      owner,
      repo,
      base_tree: commitData.data.tree.sha,
      tree: blobs as any,
    });
    
    console.log('Creating commit...');
    const newCommitResponse = await octokit.git.createCommit({
      owner,
      repo,
      message: commitMessage,
      tree: treeResponse.data.sha,
      parents: [latestCommitSha],
    });
    
    console.log('Updating reference...');
    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${branch}`,
      sha: newCommitResponse.data.sha,
    });
    
    console.log('');
    console.log('Successfully pushed to GitHub!');
    console.log(`View at: https://github.com/${owner}/${repo}`);
    
  } catch (error: any) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Details:', JSON.stringify(error.response.data));
    }
  }
}

pushToGitHub();
