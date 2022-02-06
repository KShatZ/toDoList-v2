# What is this project?

This is a *'To-Do List'* application which allows users to keep track of various task's that they need to complete. Users can create custom lists to which they can add new to-do items as they come up and delete them when their task is complete. If a custom list is no longer needed, the user can easily delete it as well. 

You can view a live version of this project which is using MongoDB Atlas and is hosted with Heroku [here](https://kirill-to-do-list.herokuapp.com/)

**I built this project to practice using Node.js, Express.js, EJS, & MongoDB/Mongoose through a functional real-world application:** 


---
This repo was initially cloned from my original to-do list [here](https://github.com/KShatZ/toDoList-course-additions), which already had a developed template for a to-do list that was using array's to populate new items into a single default list. The goal for this second version was to build upon the functionality of that project and most importantly add data persistance with MongoDB as the array in version 1 did not allow for this.


## How to run this project on your local machine

1. Ensure that you have NPM and Node.js installed on your machine
2. Make sure that you have MongoDB installed and properly configured on your machine. These instructions do not cover how to run the project with a DB that is being run on an external server, minimal changes to the code are required for this to work. 
3. In your project directory run `npm install` to install all the required dependencies.
4. Once dependencies are installed head to the **app.js** file and locate the `mongoose.connect()` function. By default the name of the database is `toDoListDB` but you may change it to whatever you like at the end of the string.
5. Start up MongoDB with the `mongod` command followed by any flags if your local configuration requires it.
6. Start the application with `node app.js` and head to `localhost:3000` in your browser of choice.


### Side Notes....

Please be respectful if you decide to add new custom lists or items on the live version of the site as I currently do not have an authentication method. This will be my next step for this project, as it will ensure that only 'admins' of the application can add new lists and items.