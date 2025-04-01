if you have your own db atlas, go to .env, and put in your own url and password in your own link

to get redis server you will need redis server u need wsl for redis server got to cmd and run -wsl -sudo apt update && sudo apt install redis -y -(if you get this after the above line E: dpkg was interrupted, you must manually run 'sudo dpkg --configure -a' to correct the problem. do thiis sudo dpkg --configure -a) -then run sudo apt update && sudo apt install redis -y -sudo service redis-server start -redis-cli ping (should return PONG)

make sure redis is started on wsl

use flask run to run code,

should print connected to mongodb and connected to redis

now install postman

once installed enter url in accordance with the functions in routers/authController ( gpt it if you want) enter method as POST go to header and write Content-Type: application/json go to body and write { "username": "testuser", "email": "test@example.com", "password": "testpass", "name": "Test User" } for signup and select raw option

{ "email": "test@example.com", "password": "testpass" } for login

etc (signup) you can gpt( give routers/authController as prompt) 










PROJECT SETUP:

1. Accept the mongo invite that abbas e-mailed which will make you a member of the project
2. In the backend folder, there's a file named generate_env.py which contains the variable "mongo_uri" in the create_env_file() function, assign the following string to it: mongodb+srv://<db_username>:<db_password>@cluster0.uk6rwuh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
3. Replace username and password with your credentials
4. Run generate_env.py and config.py(I think we only have to run one file but khair)
5. Install redis, the easiest way is to download the zip folder from their website(i tried the wsl waala method usse nahi chala) and set redist-cli's path to environment variable
6. In config.py and generate_env.py, assign 6379 to the variable redis_port(if later on you run the project and it throws a error becuase of redis ports then chat gpt will go you the solution


HOW TO RUN THE PROJECT:
1. cd to the backend folder, and type python app.py
2. In a new terminal, cd to the frontend folder, and type npm run dev

HOW TO CHECK IF YOU CONNECTED TO THE DATABASE SUCCESSFULLY
- When you run the project, in the backend waala terminal in which you ran app.py, you should see this: "Pinged your deployment. You successfully connected to MongoDB!" below your uri string.
- If you see bad authentication you messed up while entering the string, if it still doesn't work mujhe batana I'll reset you credentials and it'll work

HOW TO CHECK IF THE BACKEND IS ACTUALLY WORKING
- When you register as a new user in the app, because there are no webpages yet to redirect to upon successful login, you will have to check through the backend waala terminal or inspect the webpage
- If you the terminal is printing white post requests(as in the text is not red) and the status code is 200, that means yes scene, warna lul
- While inspecting, go to console, and udher you'll see the login responses and if you click object you can see the access token

