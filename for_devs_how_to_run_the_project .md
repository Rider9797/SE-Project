PROJECT SETUP:

1. Accept the mongo invite that abbas e-mailed which will make you a member of the project
2. In the backend folder, there's a file named generate_env.py which contains the variable "mongo_uri" in the create_env_file() function, assign the following string to it: mongodb+srv://<db_username>:<db_password>@cluster0.uk6rwuh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
3. Replace username and password with your credentials, i have sent them to you on whatsapp
4. Run generate_env.py and config.py(I think we only have to run one file but khair)
5. Install redis, the easiest way is to download the zip folder from their website(i tried the wsl waala method usse nahi chala) and set redist-cli's path to environment variable
6. In config.py and generate_env.py, assign 6379 to the variable redis_port(if later on you run the project and it throws a error becuase of redis ports then chat gpt will go you the solution


HOW TO RUN THE PROJECT:
1. cd to the backend folder, and type python app.py
2. In a new terminal, cd to the frontend folder, and type npm run dev

HOW TO CHECK IF YOU CONNECTED TO THE DATABASE SUCCESSFULLY
- When you run the project, in the backend waala terminal in which you ran app.py, you should see this: "Pinged your deployment. You successfully connected to MongoDB!" below your uri string.
- If you see bad authentication you messed up while entering the string, if it still doesn't work mujhe batana I'll reset you credentials and it'll work



