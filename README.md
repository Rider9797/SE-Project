if you have your own db atlas, go to .env, and put in your own url and password in your own link

to get redis server you will need redis server
u need wsl for redis server
got to cmd and run 
 -wsl
 -sudo apt update && sudo apt install redis -y
 -(if you get this after the above line
   E: dpkg was interrupted, you must manually run 'sudo dpkg --configure -a' to correct the problem.
   do thiis sudo dpkg --configure -a)
 -then run sudo apt update && sudo apt install redis -y
 -sudo service redis-server start
 -redis-cli ping (should return PONG)

make sure redis is started on wsl

use flask run to run code,

should print connected to mongodb and connected to redis

now install postman

once installed enter url in accordance with the functions in routers/authController ( gpt it if you want)
enter method as POST
go to header and write Content-Type: application/json 
go to body and write {
  "username": "testuser",
  "email": "test@example.com",
  "password": "testpass",
  "name": "Test User"
} for signup
and 
select raw option

{
    "email": "test@example.com",
    "password": "testpass"
} for login

etc (signup) you can gpt( give routers/authController as prompt)

