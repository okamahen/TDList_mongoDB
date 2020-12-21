This application build using heroku hosting and mongodb database, dependencies traceable at package.json file. 

Below is the method on hosting using heroku :

1). Login and Install git into the computer

2). Login and Install heroku cli; https://devcenter.heroku.com/articles/heroku-cli

3). In VSCode terminal > heroku login
    Note : In windows, normally you will be asked to login using new pop up window. If your laptop governed by company, it might unable to run the script. Please use your personal computer to ensure script enabled.

4). Create new file named "Procfile" (mind the letter case, no extension . ), this file used to inform Heroku which file to run when we run the application. For this app, inside the file, type below:
web: node server.js

5). Create dynamic port (see update on server.js)

6). Initialize GIT (name, email) and use command
git init >> to select file and create as master

7). Create new file named ".gitignore", to inform git to not track the node_modules (there are lots of files in there and we do not waste our bandwith communicating item inside the node_modules folder), and inside the file, type below:
node_modules

8). In termminal, type : git add -A to add all file into git,
and also type git commit -m'' and type first message about our first commit

9). To prepare heroku to remote git, type:
heroku git:remote -a <yourappnameinheroku>

10). Now push into cloud, type (change origin to heroku):
git push <origin> master

11). Note from learner from Brad :

If you make additional changes to your local code files and want to push those changes up to Heroku you can simply run this command:

git add -A

Then this command:

git commit -m 'Your message to yourself regarding what you changed'

Then finally this command:

git push heroku master

That's it! You can repeat this process whenever you make changes locally that you'd like to push up onto the web for this project.

Thanks,
Brad
