
Welcome Mustafa!
How can I help you today?

Tell me about this project


Quiz me on this project


My goal is...





Still stuck? Get help from a human
No file chosen

Learn Git Fundamentals
Create a Git repo, branch, resolve a merge conflict, and push to GitHub.

Maya Menon
Terminal square icon
DIFFICULTY
easy
TIME
45 min
REFRESHED
28th May '26
COST
Free
30 Second Summary
Every developer has lost work to an accidental delete or wished they could rewind a file to how it looked yesterday.  solves that problem by saving snapshots of your files over time.

In this project, you will build a  repository that tracks a markdown learning log. You will make real edits across multiple commits, create a branch, resolve a merge conflict, and push everything to a public  repository.

What You'll Build
A Git repository tracking a markdown file with a real edit history, branches, and a resolved merge conflict, all visible on a public GitHub repository.

Architecture diagram showing the project flow: a local Git repository with commits and branches on your computer, connected by git push to a public GitHub repository online.
Architecture diagram showing the project flow: a local Git repository with commits and branches on your computer, connected by git push to a public GitHub repository online.


By the end of this project, you'll have:

A local Git repository with multiple commits showing a real file evolving over time.

A branch that gets merged back into main after resolving a merge conflict.

A public GitHub repository displaying your full commit history and branches for anyone to see.

Secret Mission: Create a GitHub Profile README that displays directly on your profile page.

Want a complete demo of how to do this project, from start to finish? Check out our 🎬 walkthrough with Maya

Are there any prerequisites?

None. This project includes full setup instructions for Git, a code editor, and GitHub. No prior experience with the command line or version control is required.

👀 Step #0
Before We Start

✍️ What are we doing in this project?
Learning git


View My Work
🔧 Step #1
Set Up Git, a Code Editor, and GitHub

Before you can track changes to your files, you need a few things set up on your computer.

 is the  system that records every change you make to a file. A code editor with a built-in terminal is where you will edit files and run all your Git commands.  is where you will publish your work online so others can see it.

In this step, get ready to:
Install Git and verify it works.
Set up a code editor and open its integrated terminal.
Set up a GitHub account for publishing your work.
✍️ What are we doing in this step?
In this step, I'm setting up... so that I can...
1000

Tasks still to complete

Return to later
Install Git
Git is a program that runs on your computer and watches files for changes. Once installed, you can use it from any terminal.

Press Cmd+Space (macOS) or the Windows key (Windows) to open your search bar.

Type Terminal (macOS) or PowerShell (Windows) and press Enter to open it.

Check if Git is already installed by running this command:

bash



git --version
✔️ I see a version number
ⓧ Command not found
You should see output like git version 2.54.0 (your exact number may differ). Git is ready to go.

Terminal output showing git version 2.54.0 confirming Git is installed.
Terminal output showing git version 2.54.0 confirming Git is installed.


Set up your code editor
You need a code editor with a built-in terminal so you can edit files and run Git commands in the same window. If you already have one (like VS Code or Cursor), you're good to go. If not, we recommend installing .

✔️ I already have a code editor
ⓧ I need to install one
Great, skip ahead to opening your code editor below.

Press Cmd+Space (macOS) or the Windows key (Windows) to open your search bar.

Type the name of your code editor (e.g. Cursor) and press Enter to open it.

Cursor code editor open with an empty workspace and the integrated terminal visible at the bottom.
Cursor code editor open with an empty workspace and the integrated terminal visible at the bottom.


Code editor won't open?

On macOS, you may see a security warning saying the app is from an unidentified developer. Go to System Settings > Privacy & Security and click Open Anyway.

On Linux, make sure you restart your terminal session after installation so the application command is available. 


Your code editor has a terminal built right into it. This means you can edit files and run Git commands without switching between windows.

With your code editor open, open the integrated terminal.

Where is the backtick key?

The backtick (`) is the key in the top-left corner of your keyboard, usually sharing a key with the tilde (~). It is directly below the Escape key.

A terminal panel should appear at the bottom of the editor window. This is where you will type all your Git commands for the rest of the project.

Confirm the terminal is working by running:

bash



git --version
You should see the same version number as before (e.g. git version 2.54.0). Your editor's terminal has access to all the same programs as your system terminal.

Cursor's integrated terminal showing the output of git --version, confirming Git is accessible from within the editor.
Cursor's integrated terminal showing the output of git --version, confirming Git is accessible from within the editor.


Set up a GitHub account
GitHub is a platform for hosting Git repositories online. You will use it later to publish your learning log so anyone with the link can browse your full commit history.

✔️ I already have a GitHub account
ⓧ I need to create one
Make sure you are signed in at github.com. You will need your account when you push your repository in a later step.

📸 Take a screenshot of your code editor with the integrated terminal open, showing the output of git --version.
No file chosen
PNG or JPG (max. 10MB)


Tasks still to complete

Return to later
Your tools are ready. Next up, you will configure Git with your identity and create the markdown file you will track throughout this project.

🔍 Step #2
Configure Git and Create Your Markdown File

You have  and your code editor installed and ready to go.

Before you can start tracking files, Git needs to know who you are. Every commit gets stamped with your name and email so collaborators (and your future self) know who made each change. In this step, you will configure that identity, create a project folder, and write your first  file.

In this step, get ready to:
Set your Git identity with a name and email.
Create a project folder and open it in your code editor.
Create your learning log markdown file.
✍️ What are we doing in this step?
In this step, I'm setting up... so that I can...
1000

Tasks still to complete

Return to later
Set your Git identity
Git attaches your name and email to every commit you make. This is how other people (and future you) can tell who made a change.

Configure your Git identity by running these commands in your editor's integrated terminal:

bash



git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
Terminal output after running git config commands to set the user name and email.
Terminal output after running git config commands to set the user name and email.


What do these commands do?

The --global flag sets your identity for all Git repositories on your computer. Without it, you would need to configure your name and email inside every new project.

Use the same email you plan to use for your  account later. This links your local commits to your GitHub profile.

Confirm your identity is saved by running:

bash



git config --global --list
You should see user.name and user.email listed with the values you just entered.

Terminal output of git config --global --list showing user.name and user.email values.
Terminal output of git config --global --list showing user.name and user.email values.


Not seeing your name and email?

Make sure you included the --global flag. Without it, the config only applies inside a specific repository.

Check for typos in the commands. The key names are user.name and user.email with a dot, not a space.



Create a project folder and open it in your code editor
Every Git project lives inside a folder. You will create a dedicated folder for your learning log so Git can track everything inside it.

Move to your Desktop by running this command:

bash



cd ~/Desktop
Create your project folder and move into it by running these commands:

bash



mkdir git-learning-log
cd git-learning-log
Terminal showing the cd ~/Desktop, mkdir git-learning-log, and cd git-learning-log commands completed.
Terminal showing the cd ~/Desktop, mkdir git-learning-log, and cd git-learning-log commands completed.


Open this folder in your code editor by clicking File in the top menu bar.

Click Open Folder.

Navigate to your Desktop and select the git-learning-log folder, then click Open.

Cursor's Open Folder dialog with the git-learning-log folder selected on the Desktop.
Cursor's Open Folder dialog with the git-learning-log folder selected on the Desktop.


You should see git-learning-log in the editor's title bar or the top of the Explorer sidebar. The folder is empty for now.

Where is my terminal now?

When you open a folder in your code editor, the integrated terminal automatically points to that folder. Open a new terminal with Ctrl+` (Windows/Linux) or Cmd+` (macOS) if you do not see one open already.

Can't find the folder? Look on your Desktop for a folder called git-learning-log. On macOS, that is ~/Desktop/git-learning-log. On Windows, it is C:\Users\yourname\Desktop\git-learning-log.



Create your markdown file
Now you need a file for Git to track. You will create a Markdown file called learning-log.md that serves as your learning log throughout this project.

Create a new file in your code editor by clicking the new file icon at the top of the Explorer sidebar, or by pressing Cmd+N (macOS) or Ctrl+N (Windows/Linux).

Save the file immediately with the name learning-log.md by pressing Cmd+S (macOS) or Ctrl+S (Windows/Linux).

Cursor's Explorer sidebar showing the new empty learning-log.md file inside the git-learning-log folder.
Cursor's Explorer sidebar showing the new empty learning-log.md file inside the git-learning-log folder.


Paste the following content into your learning-log.md file:

learning-log.md
markdown



# My Learning Log

## About This Project
I'm learning Git and version control to track my work.

## Goals
- Understand how commits work
- Learn branching and merging
- Push my work to GitHub
Cursor editor showing learning-log.md with the starter markdown content pasted in.
Cursor editor showing learning-log.md with the starter markdown content pasted in.


What is Markdown?

Markdown is a lightweight formatting language that uses symbols like # for headings and - for bullet points. The .md file extension tells editors to treat the file as Markdown.

GitHub renders Markdown files with nice formatting automatically. This is why README files on GitHub look clean and structured.

Save learning-log.md with Cmd+S (macOS) or Ctrl+S (Windows/Linux).

Confirm the file appears in the Explorer sidebar. You should see learning-log.md listed under the git-learning-log folder.

Don't see the file in the sidebar?

Make sure you saved the file with the .md extension. If you used Cmd+N/Ctrl+N, the editor may have saved it as an untitled file. Use Save As and type learning-log.md as the file name.

Check that the file was saved inside the git-learning-log folder, not in a parent directory.



✔️ Awesome, I've got everything!
ⓧ I'd like to double check the full code
Great. Double check you have saved your file before moving on.

📸 Take a screenshot of your code editor showing learning-log.md open with content and the Explorer sidebar showing the file inside git-learning-log.
No file chosen
PNG or JPG (max. 10MB)




Tasks still to complete

Return to later
Your Git identity is configured and your learning log file is ready. Next up, you will turn this folder into a real Git repository and make your first commits.

✨ Step #3
Initialize a Repo and Make Your First Commits

Your project folder is set up and your learning log is ready. Now it's time to put  to work.

In this step, you'll turn your folder into a Git repository and save your first snapshots. Each snapshot is called a , and it captures the exact state of your files at that moment in time.

In this step, get ready to:
Initialize a Git repository in your project folder.
Make two commits showing real changes to your file.
Verify your commit history with Git's built-in tools.
✍️ What are we doing in this step?
In this step, I'm setting up... so that I can...
1000

Tasks still to complete

Return to later
Initialize the repository and make your first commit
A  (or "repo") is a folder that Git is actively watching for changes. Right now your git-learning-log folder is just a regular folder. You need to tell Git to start tracking it.

Initialize your repository and save your first commit by running these commands in your editor's terminal:

bash



git init
git add learning-log.md
git commit -m "Add initial learning log"
Terminal output after running git init, git add, and git commit showing the first commit was created successfully.
Terminal output after running git init, git add, and git commit showing the first commit was created successfully.


What do these commands do?

git init turns your folder into a Git repository. Git creates a hidden .git folder to store all its tracking data.

git add learning-log.md tells Git you want to include this file in your next snapshot. This is called "staging."

git commit -m "..." saves the snapshot with a short message describing what changed.

Verify your commit was saved by running:

bash



git log
Terminal output of git log showing one commit entry with the message Add initial learning log.
Terminal output of git log showing one commit entry with the message Add initial learning log.


You should see one entry showing your commit message "Add initial learning log", along with your name, email, and a timestamp.

Seeing an error about 'not a git repository'?

Make sure your terminal is inside the git-learning-log folder. Run pwd (macOS/Linux) or cd (Windows) to see your current location.

If you're in the wrong folder, navigate to the correct one and run git init again.



Make a change and commit again
One commit is a good start, but the real power of Git shows up when you have multiple commits. Each commit records what changed between snapshots, so you can trace how your file evolved.

Open learning-log.md in your code editor by clicking on it in the Explorer sidebar.

Add a new section at the very bottom of the file, below the Goals list:

learning-log.md
markdown



## What I Learned Today
- Git tracks changes to files over time
✔️ Awesome, I've got everything!
ⓧ I'd like to double check the full code
Great. Double check you've saved your file before moving on.

Cursor editor showing learning-log.md with the new What I Learned Today section added at the bottom.
Cursor editor showing learning-log.md with the new What I Learned Today section added at the bottom.


What does this addition do?

You're adding real content that reflects something you just learned. This is the kind of meaningful change that makes commit history useful. When you look back later, you'll see exactly when you added this insight.

Save learning-log.md by pressing Cmd+S (macOS) or Ctrl+S (Windows).

Stage and commit the change by running these commands in the terminal:

bash



git add learning-log.md
git commit -m "Add What I Learned section"
Verify you now have two commits by running:

bash



git log
You should see two entries. The most recent commit ("Add What I Learned section") appears at the top, and your first commit ("Add initial learning log") appears below it.

Terminal output of git log --oneline showing two commits.
Terminal output of git log --oneline showing two commits.


Only seeing one commit?

Make sure you saved learning-log.md before running git add. Git stages the file as it exists on disk, not what's in your editor.

If you forgot to save first, save now, then run git add learning-log.md and git commit -m "Add What I Learned section" again.



Check your status and diff
Git gives you tools to check the current state of your repository at any time. These commands become second nature as you work with Git more.

Confirm your working directory is clean (no uncommitted changes) by running:

bash



git status
You should see a message saying "nothing to commit, working tree clean." This means every change you've made has been committed.

Terminal output of git status showing nothing to commit, working tree clean.
Terminal output of git status showing nothing to commit, working tree clean.


View a compact version of your commit history by running:

bash



git log --oneline
Terminal output of git log --oneline showing two short commit entries with hashes and messages.
Terminal output of git log --oneline showing two short commit entries with hashes and messages.


You should see two short lines, each with a commit hash (a short code like a1b2c3d) followed by your commit message. This is the quickest way to scan your project's history.

What is a commit hash?

The short code at the start of each line is a unique identifier for that commit. Git generates it automatically. You can use it later to jump back to any specific snapshot in your project's history.

📸 Take a screenshot of your terminal showing the output of git log --oneline with both commits visible.
No file chosen
PNG or JPG (max. 10MB)




Tasks still to complete

Return to later
You now have a real Git repository with two commits proving your file changed over time. Next up, you'll create a branch to experiment with changes without touching your main history.

📝 Step #4
Create a Branch and Make Parallel Changes

You have two commits on main and a clean working directory. Your project has a solid history you can build on.

In this step, you will create a separate branch to experiment on. You will then make different changes on each branch, setting up a  that you will resolve in the next step.

In this step, get ready to:
Create a new branch and switch to it.
Make a commit on the new branch.
Make a conflicting commit on main to set up a merge conflict.
✍️ What are we doing in this step?
In this step, I'm creating... so that I can...
1000

Tasks still to complete

Return to later
Create and switch to a new branch
A  is a separate line of development. Changes you make on one branch do not affect other branches until you merge them together.

What is a branch?

Think of a branch as a copy of your project where you can experiment freely. The original stays safe on main while you try things on your new branch.

When you are happy with your experiment, you can merge the branch back into main. If the experiment fails, you can delete the branch without ever touching your main work.

Create a new branch called add-resources and switch to it by running this command:

bash



git checkout -b add-resources
Terminal output showing Switched to a new branch add-resources after running git checkout -b.
Terminal output showing Switched to a new branch add-resources after running git checkout -b.


Confirm you are on the new branch by running:

bash



git branch
You should see add-resources highlighted with an asterisk (*). This confirms you are now working on the new branch.

Terminal output of git branch showing an asterisk next to add-resources, confirming the active branch.
Terminal output of git branch showing an asterisk next to add-resources, confirming the active branch.


Don't see the asterisk on add-resources?

If you only see main listed, the checkout command may not have run successfully. Check your terminal for any error messages and try running git checkout -b add-resources again.

If you see an error saying the branch already exists, run git checkout add-resources (without the -b flag) to switch to the existing branch.



Make changes on the branch and commit
Now that you are on the add-resources branch, any changes you make will only exist on this branch. The main branch stays exactly as it was.

Open learning-log.md in Cursor.

Find the ## What I Learned Today section.

Replace the entire section (heading and bullet) with the following content:

markdown



## What I Learned Today
- Git tracks changes to files over time
- Branches let you experiment without affecting the main project
- You can merge branches back together when ready
What does this change represent?

You kept the original bullet point and added two new ones about branching. This simulates the kind of edits you would make on a feature branch in a real project.

Save learning-log.md.

Stage and commit your changes by running these commands:

bash



git add learning-log.md
git commit -m "Expand learning notes on branches"
Terminal output of git commit showing the Expand learning notes on branches commit was created on the add-resources branch.
Terminal output of git commit showing the Expand learning notes on branches commit was created on the add-resources branch.


Verify your commit by running:

bash



git log --oneline
You should see three commits. The newest one at the top says "Expand learning notes on branches".

Terminal output of git log --oneline showing three commits on the add-resources branch.
Terminal output of git log --oneline showing three commits on the add-resources branch.


Seeing 'nothing to commit'?

This means Git did not detect any changes to the file. Make sure you saved learning-log.md after editing it. In Cursor, press Cmd+S (macOS) or Ctrl+S (Windows/Linux), then try the git add and git commit commands again.



Switch back to main and make a conflicting change
Now you will switch back to main and make a different edit to the same section. This creates two branches with conflicting changes to the same lines.

Switch back to the main branch by running this command:

bash



git checkout main
Open learning-log.md in Cursor.

Notice that the file has reverted to its state on main. Your branch changes are safely stored on add-resources and do not appear here.

Why did my file change back?

When you switch branches, Git updates your files to match the state of that branch. Your three-bullet version still exists on add-resources. Git is just showing you what main looks like right now.

Find the ## What I Learned Today section.

Replace the entire section (heading and bullet) with different content this time:

markdown



## What I Learned Today
- Git is like a time machine for your files
- Every commit is a snapshot you can go back to
Cursor editor showing learning-log.md on the main branch with the time machine analogy content.
Cursor editor showing learning-log.md on the main branch with the time machine analogy content.


Why different content?

You are intentionally writing different bullets than what you put on the add-resources branch. Both branches now change the same lines in different ways. When you try to merge them, Git will not know which version to keep. That is a merge conflict.

Save learning-log.md.

Stage and commit your changes by running these commands:

bash



git add learning-log.md
git commit -m "Rewrite learning notes with time machine analogy"
Terminal output of git commit showing the Rewrite learning notes with time machine analogy commit was created on main.
Terminal output of git commit showing the Rewrite learning notes with time machine analogy commit was created on main.


Verify your branch history by running:

bash



git log --oneline
Terminal output of git log --oneline showing three commits on the main branch.
Terminal output of git log --oneline showing three commits on the main branch.


You should see three commits on main. The newest one says "Rewrite learning notes with time machine analogy".

Still seeing the branch content in your file?

Make sure you ran git checkout main before editing. Run git branch to check which branch you are on. The asterisk should be next to main.



✔️ Awesome, I've got everything!
ⓧ I'd like to double check the full code
Great. Double check you have saved your file and that git log --oneline shows three commits on main.

📸 Take a screenshot of your terminal showing the output of git log --oneline with three commits on the main branch.
No file chosen
PNG or JPG (max. 10MB)




Tasks still to complete

Return to later
You now have two branches with different changes to the same lines. This is exactly the situation that causes a merge conflict. Next up, you will merge these branches and resolve the conflict yourself.

🚀 Step #5
Merge and Resolve the Conflict

You now have two branches with different changes to the same lines.

When Git cannot automatically combine changes because both branches edited the same section, it creates a . In this step, you will intentionally trigger a conflict, understand what Git is showing you, and resolve it by hand.

In this step, get ready to:
Attempt to merge two branches with conflicting changes.
Read and understand Git's conflict markers.
Resolve the conflict and complete the merge commit.
✍️ What are we doing in this step?
In this step, I'm merging... so that I can...
1000

Tasks still to complete

Return to later
Attempt the merge
A merge pulls changes from one branch into another. Git tries to combine the changes automatically, but when both branches edited the same lines, it stops and asks you to decide what to keep.

Confirm you are on the main branch by running:

bash



git branch
Terminal output of git branch showing an asterisk next to main, confirming the active branch.
Terminal output of git branch showing an asterisk next to main, confirming the active branch.


You should see an asterisk next to main, confirming you are on the correct branch.

Merge the add-resources branch into main by running:

bash



git merge add-resources
Git will report a conflict: CONFLICT (content): Merge conflict in learning-log.md. This is expected and normal.

Terminal output showing CONFLICT (content): Merge conflict in learning-log.md after running git merge add-resources.
Terminal output showing CONFLICT (content): Merge conflict in learning-log.md after running git merge add-resources.


Why is a conflict a good thing here?

Git is not broken. It is telling you that both branches changed the same section of the file, and it does not want to guess which version you prefer.

This is Git protecting your work. You get to decide what the final version looks like.

Understand and resolve the conflict
In the learning-log.md, you will see conflict markers that Git inserted into the file:

learning-log.md
markdown



<<<<<<< HEAD
- Git is like a time machine for your files
- Every commit is a snapshot you can go back to
=======
- Git tracks changes to files over time
- Branches let you experiment without affecting the main project
- You can merge branches back together when ready
>>>>>>> add-resources
What do these conflict markers mean?

The section between <<<<<<< HEAD and ======= is what is on your current branch (main).

The section between ======= and >>>>>>> add-resources is what is on the branch you are merging in.

Your job is to delete all the marker lines and keep the content you want.

Cursor editor showing learning-log.md with Git conflict markers highlighting both versions of the What I Learned Today section.
Cursor editor showing learning-log.md with Git conflict markers highlighting both versions of the What I Learned Today section.


Why not click Accept Current Change or Accept Incoming Change?

Your code editor might show shortcut buttons above the conflict markers: Accept Current Change, Accept Incoming Change, and Accept Both Changes. These buttons either pick one side entirely or concatenate both without any editing.

In real projects, conflicts are rarely that clean. You often need to keep some lines from each side, rewrite others, or reorder content. Resolving by hand teaches you to read the markers and decide exactly what the final version should look like.

Delete ALL the conflict markers (<<<<<<<, =======, >>>>>>>) and combine the content from both branches.

Replace the entire conflicted section so it looks like this:

learning-log.md
markdown



## What I Learned Today
- Git is like a time machine for your files
- Every commit is a snapshot you can go back to
- Branches let you experiment without affecting the main project
- You can merge branches back together when ready
Cursor editor showing learning-log.md after resolving the conflict, with all four bullet points combined and no conflict markers.
Cursor editor showing learning-log.md after resolving the conflict, with all four bullet points combined and no conflict markers.


Why keep all four bullets?

When resolving a conflict, you can keep content from one branch, the other, or both. Here you are combining the best of both branches into a single cohesive list.

Save learning-log.md.

Confirm there are no leftover conflict markers (<<<<<<<, =======, or >>>>>>>) anywhere in the file.

Still seeing conflict markers in the file?

Use Cursor's search (Cmd+F on macOS, Ctrl+F on Windows) and search for <<<. If it finds any results, you still have markers to remove. Delete every line containing <<<<<<<, =======, or >>>>>>>.



Complete the merge
Saving the file is not enough. You still need to tell Git that the conflict is resolved by staging the file and creating a merge commit.

Stage the resolved file and create the merge commit by running these commands:

bash



git add learning-log.md
git commit -m "Merge add-resources branch and resolve conflict"
Terminal output of git add and git commit showing the merge commit was created successfully.
Terminal output of git add and git commit showing the merge commit was created successfully.


What does this do?

git add learning-log.md tells Git you have finished resolving the conflict in this file.

git commit creates the merge commit that ties both branches together.

View a visual representation of your branch history by running:

bash



git log --oneline --graph
You should see a branching diagram with lines showing where add-resources split off from main and where the two branches came back together at the merge commit.

Terminal output of git log --oneline --graph showing the branching diagram with the merge point where add-resources rejoins main.
Terminal output of git log --oneline --graph showing the branching diagram with the merge point where add-resources rejoins main.


Seeing 'fatal: not possible to fast-forward'?

This means you may have run the merge command without being on the main branch. Run git branch to check which branch you are on. If you are not on main, run git checkout main first, then try the merge again.



📸 Take a screenshot of your terminal showing the output of git log --oneline --graph with the merge commit visible.
No file chosen
PNG or JPG (max. 10MB)




Tasks still to complete

Return to later
✔️ Awesome, I've got everything!
ⓧ I'd like to double check the full code
Great. Double check you have saved learning-log.md and your working directory is clean (git status shows nothing to commit).

You just resolved your first merge conflict. Your local repository now has a clean history showing real branching and merging. Next up, you will push everything to GitHub so the world can see your work.

💡 Step #6
Create a GitHub Repo and Push

You just resolved your first merge conflict. Your local repository has a complete history with commits on multiple branches and a clean merge.

There is one problem. Everything still lives on your computer. In this step, you'll push your repository to  so anyone with the link can browse your full commit history, branches, and merge.

In this step, get ready to:
Create a public GitHub repository.
Push your local repository to GitHub.
Verify your commit history and branches are visible online.
✍️ What are we doing in this step?
In this step, I'm setting up... so that I can...
1000

Tasks still to complete

Return to later
Create a GitHub repository
A  repository is a copy of your project hosted on a server that others can access. GitHub is the most popular platform for hosting Git repositories.

✔️ I already have a GitHub account
ⓧ I don't have one yet
Great. Continue with the instructions below to create your repository.

Sign in to your GitHub account at github.com.

Click the + icon in the top-right corner of GitHub.

Select New repository.

GitHub interface showing the plus icon menu with New repository selected.
GitHub interface showing the plus icon menu with New repository selected.


Enter git-learning-log as the repository name.

Leave the visibility set to Public.

Do NOT check Add a README file. You already have local content to push.

Click Create repository.

GitHub Create a new repository form with git-learning-log entered as the name and Public visibility selected.
GitHub Create a new repository form with git-learning-log entered as the name and Public visibility selected.


Why leave the README unchecked?

If GitHub creates a README for you, the remote repository starts with a commit that your local repo does not have. This causes a conflict when you try to push. Since you already have commits locally, you want an empty remote to push into cleanly.

GitHub will show you a setup page with commands for connecting an existing repository. You will use those in the next substep.

Connect your local repo to GitHub and push
Run these commands to connect your local repository to GitHub and push all your commits:

bash



git remote add origin https://github.com/your GitHub username/git-learning-log.git
git branch -M main
git push -u origin main
git push origin add-resources
Git will likely open a browser window during the push, asking you to sign in to GitHub. If so, follow the prompts to authenticate.

What do these commands do?

git remote add origin tells Git where your remote repository lives. The name origin is the standard label for your primary remote.

git branch -M main renames your current branch to main if it isn't already. GitHub expects this name by default.

git push -u origin main uploads your entire commit history to GitHub. The -u flag links your local branch to the remote so future pushes are simpler.

git push origin add-resources uploads your feature branch so it appears in GitHub's branch list.

You should see output ending with a line like Branch 'main' set up to track remote branch 'main' from 'origin'. This confirms your push was successful.

Terminal output of git push showing the main branch was successfully pushed to origin on GitHub.
Terminal output of git push showing the main branch was successfully pushed to origin on GitHub.


Push rejected or authentication failed?

If you see fatal: remote origin already exists, run git remote remove origin and then re-run the git remote add command with the correct URL.

If authentication fails, make sure you followed the browser sign-in prompt completely. Git no longer accepts passwords directly. The browser OAuth flow handles authentication automatically.

Double check that your repository URL matches your actual GitHub username exactly. Even one character difference will fail.



Verify on GitHub
Your repository is now live on GitHub. Time to confirm everything made it.

Refresh your repository page on GitHub in your browser. Confirm you see learning-log.md listed in the file view.

GitHub repository page showing learning-log.md file listed in the code view with the rendered markdown content below.
GitHub repository page showing learning-log.md file listed in the code view with the rendered markdown content below.


Click the commits link (near the top of the page, showing a number like "5 commits").

GitHub commit history page showing all commits including the merge commit.
GitHub commit history page showing all commits including the merge commit.


Browse through your commit history. You should see every commit you made, including the merge commit.

Click the branch dropdown (it will say main) and confirm you also see add-resources listed.

GitHub branch dropdown showing both main and add-resources branches available.
GitHub branch dropdown showing both main and add-resources branches available.


What should I see?

Your GitHub repository page displays the contents of learning-log.md rendered as formatted markdown. The commit history shows each snapshot you created, including the merge commit that joined your two branches together.

GitHub repository page displaying the rendered learning-log.md with all sections and bullet points formatted.
GitHub repository page displaying the rendered learning-log.md with all sections and bullet points formatted.


📸 Take a screenshot of your GitHub repository page showing your commit history.
No file chosen
PNG or JPG (max. 10MB)




Tasks still to complete

Return to later
Your learning log is now public for the world to see. Next up, there is a secret mission waiting for you to level up your GitHub profile.

💎 SECRET MISSION
Create a GitHub Profile README

You know how some GitHub profiles have a slick introduction right at the top of their page? That's a Profile README. It's a special repository that GitHub renders directly on your profile for anyone to see. Time to make yours.

keyhole
🤫 Secret Mission
Ready for a challenge? Secret Missions are for students looking to showcase more advanced skills.


Jump in!
🗑 Before you go
Clean Up Your Resources

This project runs entirely locally and uses free services, so there are no ongoing costs. Decide whether to keep your resources running, pause them to come back later, or delete them entirely.

Resources you used:

Local git-learning-log folder with your Git repository.
GitHub account.
GitHub git-learning-log repository (public).
Code editor (installed application).
Git (installed via system package or installer).
✔️ Keep everything running
✋ Pause - I'll come back to this later
ⓧ Delete - I don't want to use this again
No action needed. Choose this if you plan to keep building on your learning log or want to reference your commit history later.

Your local folder and GitHub repo stay as they are.

Git and your code editor remain installed and ready for future projects.

Your GitHub repository remains publicly visible at your repo URL.

✍️ What were the key tools and concepts you learnt in this project?
The key tools I used include... Key concepts I learnt include...
1000



Tasks still to complete

Return to later
🎉 Mission Accomplished
Nice Work!

You just went from zero  knowledge to having a public  repository with real commit history, branches, and a resolved merge conflict.

You've learned how to:

Track a real file over time using commits that capture every meaningful change.

Create a branch to experiment safely, then merge it back into your main project.

Resolve a merge conflict by reading conflict markers and combining changes from both branches.

Push your local repository to a remote on GitHub so anyone can see your full version history and Secret Mission: created a GitHub Profile README that displays directly on your profile page.

Ready to quiz yourself?

Git Fundamentals
5 questions
2.5 minutes
Test your knowledge of Git repositories, commits, branching, and merge conflicts.


Want to keep going? Continue learning with Git Fundamentals (Part 2).



















Documentation



Learn Git Fundamentals
By
Mustafa Ali Akbar
June 2026

Share Work
Project Overview: Learning Git Version Control
Goals and objectives
Learning git

Give us your feedback on this project



😢

🙁

😐

🙂

😄
Share your thoughts on this project...

Submit feedback

NextWork Logo

Ask

Projects

Documentation
