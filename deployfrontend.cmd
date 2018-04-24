robocopy src docs /e
robocopy build\contracts docs
git add .
git commit -m "adding frontend files to github pages"
git push
