# Vercel Clone

This project replicates the core functionality of Vercel, enabling deployment of frontend applications. The focus is on Client-Side Rendering (CSR) and excludes support for Server-Side Rendering (SSR).

## Technologies Used

- TypeScript
- Node.js
- Express.js
- Redis
- Docker
- AWS S3
## Prerequisites

Before running the project locally, ensure the following are installed and set up:

- Docker (for running Redis)
- Redis (configured properly in .env files)
- An AWS Account with an S3 bucket configured.
## Installation

1. Clone the Repository

```bash
git clone https://github.com/Arnab2002Pal/vercel-clone.git
cd vercel-clone  
```
2. Setup Redis
Ensure Redis is running locally or accessible via Docker. Use the appropriate configurations in the .env files.

To start Redis with Docker:
```bash
docker run --name redis -d -p 6379:6379 redis  
```
3. Install Dependencies
Each server and the frontend has its own dependencies. Navigate to the respective directories and install dependencies:

For each server (Upload Server, Build Server, Request Handler):
```bash
cd <server-folder>  
npm install   
```
For the frontend:
```bash
cd frontend  
npm install  
```

4. Build and Start Backend Servers
    - Navigate to the respective server directory:
        - Upload Server & Request Handler runs on different port.
    - Run the following commands:
```bash
npm run build  
npm start  
```
5. Build and Start Frontend Server:
Navigate to the frontend folder and use the following commands:
```bash
npm run build  
npm run preview  
```
Alternatively, for development:
```bash
npm run dev
```
## Environment Variables

To run Upload Server, you will need to add the following environment variables to your .env file
```bash
REDIS_HOST
PORT
MAX_LENGTH
AWS_ACCESS_KEY
AWS_SECRET_KEY
AWS_REGION
AWS_BUCKET
```

To run Build Server, you will need to add the following environment variables to your .env file

```bash
REDIS_HOST
AWS_ACCESS_KEY
AWS_SECRET_KEY
AWS_REGION
AWS_BUCKET
```

To run Request Handler, you will need to add the following environment variables to your .env file

```bash
PORT
AWS_ACCESS_KEY
AWS_SECRET_KEY
AWS_REGION
AWS_BUCKET
```

To run Frontend Server, you will need to add the following environment variables to your .env file

```bash
VITE_BACKEND
```
## Related

- Ensure Redis is properly configured before starting the servers.
- The Upload Server runs on port 3002 and the Request Handler runs on port 3003.
- AWS S3 is required for storing uploaded files.
