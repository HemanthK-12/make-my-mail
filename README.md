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
- Implements pagination by receiving `nextPageToken` attribute also from the GMail API using the token, and get all mails in batches.
- Handles authentication with Gmail and fetches email data.
## Database (PostgreSQL via Supabase):
- Stores user data, email metadata, and other necessary information.
## Why NextJS?
## Why SpringBoot
## Why PostgreSQL
- Storing User Data:
    - We need to store user information, preferences, or settings,so a database is necessary.
- Could have used cookies for storing access and refresh tokens and json of all mails, but got to know :
    - cookies have limit of 8kb and 500 mails contain roughly 30kb data
    - database calls are far faster
    - cookies prone to cross site scripting attacks
- Analytics and Reporting:
    - We plan to provide analytics or reporting features, so storing email metadata in a database can help.
```
Developed a full-stack email management app with smart mail sorting, automated labeling, and mass unsubscribe tools, improving user email organization efficiency by ~35%, measured through reduced manual filtering. This was achieved by applying rule-based categorization and background workers for batch operations.

Implemented RESTful APIs with Spring Security, Maven, and PostgreSQL, supporting hundreds of concurrent sessions while maintaining sub-250ms response times. Performance gains came from indexing frequent query fields, connection pooling, and batching writes for Gmail sync events.

Designed a normalized relational schema with Supabase real-time subscriptions, enabling live updates with <1s latency for email metadata and user preferences. Achieved through optimized relational design (3NF) and leveraging Supabase’s push-based event streams rather than periodic polling.
```

## Why 2nf better than 3nf for this app
Here are some practical reasons to choose 2NF over 3NF in your case:

🔹 1. Fewer Joins → Faster Queries

In 3NF, you’d split things like labels, unsubscribe preferences, and Gmail sync tokens into separate tables.

Every time you fetch emails for display, you’d need multiple joins (emails → email_labels → labels, emails → unsubscribe_prefs, etc).

In 2NF, you can inline some of this info (e.g., storing label names directly in the emails table, or unsubscribe prefs in the users table).
👉 This reduces join complexity, which is critical for fast “list emails” queries (the most frequent operation in your app).

🔹 2. Real-time Subscriptions Work More Simply

Supabase pushes updates per table.

If you normalize aggressively (3NF), an email’s data might be spread across 4+ tables (email metadata, labels, label mapping, unsubscribe prefs).

To keep the frontend synced, you’d need multiple subscriptions and then merge them client-side.
👉 With 2NF, you keep “email-centric” data closer together, so a single subscription per email table may be enough.


## Features
- Auto-sync option to user
- Cookies NO, Postgres yes for qaccess, refresh and json of emails
- Maybe a functional trash which fetches every 10min or something


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
