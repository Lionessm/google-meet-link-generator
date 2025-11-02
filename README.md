# Google Meet Link Generator

A NestJS-based backend application that programmatically generates Google Meet links by creating calendar events with Meet video conferencing enabled.

## About

This project demonstrates:
- **NestJS** framework for modular, scalable Node.js applications
- **Google Calendar API** integration via the official `googleapis` Node.js client
- **OAuth2 authentication** flow
- **Programmatic Meet link generation** through calendar events

For detailed technical decisions, architecture breakdown, and setup challenges, see [dev-notes.md](dev-notes.md).

## Quick Start

### Prerequisites
- Node.js 18+
- Google Cloud Console account
- OAuth 2.0 credentials (see dev-notes.md for detailed setup)

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file in the root directory:

```env
GOOGLE_CLIENT_ID=your_client_id_from_google_cloud_console
GOOGLE_CLIENT_SECRET=your_client_secret_from_google_cloud_console
GOOGLE_REDIRECT_URI=http://localhost:3010/auth/google
```

### Run the Application

```bash
npm run start
```

The application will start on port 3010.

### First-Time Authentication

Visit http://localhost:3010/auth/google/refresh-token to authenticate with Google.

Or use curl:

```bash
curl --location 'http://localhost:3010/auth/google/refresh-token'
```

This will open your browser automatically for Google OAuth authentication.

## Usage Example

Once authenticated, you can create a Google Meet event by making a POST request:

```bash
curl --location 'http://localhost:3010' \
--header 'Content-Type: application/json' \
--data-raw '{
     "summary": "DevRel Test",
     "description": "firstTest",
     "startDate": "2025-11-02T15:00:00.000Z",
     "endDate": "2025-11-02T16:00:00.000Z",
     "attendeesEmails": ["maria.mihaila.17@gmail.com"]
}'
```

**Response**:
```json
{
  "summary": "DevRel Test",
  "start": "2025-11-02T15:00:00.000Z",
  "meetLink": "https://meet.google.com/abc-defg-hij"
}
```

## Detailed Setup

For comprehensive setup instructions, OAuth credential configuration, and implementation details, see [dev-notes.md](dev-notes.md).

## API Endpoints

- `POST /` - Create a Google Meet event
- `GET /auth/google/refresh-token` - Initiate OAuth authentication
- `GET /auth/google` - OAuth callback handler - used only internally
