# MakeMyMail Architecture

- NextJS for frontend
- Spring Boot for backend
- PostgreSQL (through Supabase BaaS) as database

## "How to use this to print all Gmail mails?"

- Extract the access token from your OAuth2AuthenticationToken
- Create Gmail API service client
- Call Gmail API to list messages
- Fetch full message details for each email
- Parse email headers (subject, from, date, etc.)
- Return structured data

## "Group Gmail mails by sender"

- Fetch all emails (as above)
- Extract sender email from each message's "From" header
- Use Java Streams to group emails by sender email address
- Create summary objects showing sender + their emails
- Sort by most recent email or email count

## "Next.js as frontend"
- Your Spring Boot backend will:
    - Provide REST APIs (like /api/gmail/emails)
    - Return JSON data
    - Handle authentication via session cookies
- Your Next.js frontend will:
    - Make HTTP requests to your Spring Boot APIs
    - Receive JSON email data
    - Display in React components
    - Handle user interactions (expand/collapse groups, search, etc.)

## Frontend (Next.js):
- Handles the user interface and makes requests to the backend to fetch email data.
- Backend (Spring Boot):
## Backend (Spring Boot):
- Acts as an intermediary between the frontend and Gmail API.
- Handles authentication with Gmail and fetches email data.
## Database (PostgreSQL via Supabase):
- Stores user data, email metadata, and other necessary information.
## Why NextJS?
## Why SpringBoot
## Why PostgreSQL
- Storing User Data:
    - We need to store user information, preferences, or settings,so a database is necessary.
- Caching Email Data:
    - If we want to cache email data to improve performance and reduce the number of API calls to Gmail, a database can be useful.
- Analytics and Reporting:
    - We plan to provide analytics or reporting features, so storing email metadata in a database can help.
- User Authentication and Authorization:
    - We also need to manage persistent user authentication and authorization,so we will need a database to store user credentials and tokens.

## User Authentication
This is what I've planned for the flow of Google auth.
- User Authentication:

    - The user initiates the authentication process from the Next.js frontend.
    - The frontend redirects the user to the Spring Boot backend, which handles the OAuth2 authentication with Google.
- Backend Authentication:

    - The Spring Boot backend manages the OAuth2 flow, including redirecting the user to Google's authentication page and handling the callback.
    - Once authenticated, the backend stores the user's session and access token.
- Frontend Interaction:

    - The Next.js frontend makes authenticated requests to the Spring Boot backend.
    - The backend verifies the user's session and processes the requests.