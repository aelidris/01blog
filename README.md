commands used:
to run backend: 
mvn spring-boot:run
 (in port 8080) OR 
 ./mvnw spring-boot:run


to run the frontend: 
npm install 
after that do: 
npm start (in port 4200) 

Check the Browser: Go to http://localhost:4200

Open your browser and go to: http://localhost:8080/h2-console

Step 2: Log In
When the login screen appears, make sure the settings match what we put in your application.properties:

Saved Settings: Generic H2 (Embedded)

Driver Class: org.h2.Driver

JDBC URL: jdbc:h2:mem:blogdb (This is very important! It must match exactly).

User Name: sa

Password: password

Click Connect.



Testing the register:
1. The Final Test: Create a Real User
Go to your browser and fill out the form in your new beautiful interface:

Username: YourName

Email: test@test.com

Password: 12345

Click Register.



We can use H2 database (that based on store at the memory) after finishing we can easly changing to PostgreSQL or MySQL