# MakeMyMail Architecture

- NextJS for frontend
- Spring Boot for backend
- PostgreSQL (through Supabase BaaS) as database

## Frontend (Next.js):
- Handles the user interface and makes requests to the backend to fetch email data.
- Backend (Spring Boot):
## Backend (Spring Boot):
- Acts as an intermediary between the frontend and Gmail API.
- Handles authentication with Gmail and fetches email data.
## Database (PostgreSQL via Supabase):
- Stores user data, email metadata, and other necessary information.
### Why NextJS?
### Why SpringBoot
### Why PostgreSQL
- Storing User Data:
    - We need to store user information, preferences, or settings,so a database is necessary.
- Caching Email Data:
    - If we want to cache email data to improve performance and reduce the number of API calls to Gmail, a database can be useful.
- Analytics and Reporting:
    - We plan to provide analytics or reporting features, so storing email metadata in a database can help.
- User Authentication and Authorization:
    - We also need to manage persistent user authentication and authorization,so we will need a database to store user credentials and tokens.
