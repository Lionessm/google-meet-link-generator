# Dev Diary: Google Meet Link Generator

## Project Overview
A NestJS-based backend application that programmatically generates Google Meet links by creating calendar events with Meet video conferencing enabled.

## Setup Exploration & Key Decisions

### Why NestJS?
**Decision**: Use NestJS framework instead of plain Express.js

**Rationale**:
- **Modularity**: NestJS encourages modular architecture with clear separation of concerns through modules, services, and controllers
- **Service Segregation**: Built-in dependency injection makes it easy to separate business logic (services) from request handling (controllers)
- **Type-Safe Development**: Native TypeScript support with decorators for better clarity in architecture
- **Scalability**: Well-structured foundation that scales well as the application grows
- **Best Practices**: Opinionated framework that enforces patterns like dependency injection, making code more maintainable and testable. It can also have Guards for authentication and built in validation for checking input - for this MVP it was not implemented as I only wanted to focus on basic functionality.

**Alternative Considered**: Plain Express.js
**Why Not**: While simpler initially, Express would require more manual setup for dependency injection, testing, and maintaining clean architecture as complexity grows.

## Getting Google OAuth Credentials ⚠️

**Note**: The biggest stressor in this implementation is getting the credentials you need. As such, here is a detailed overview of how to achieve that.

### Approach
Getting credentials for using your personal email as a bot. (An alternative is to have Google Workspace (organization) account in order to provide Domain-Wide delegations access; however, I used a simple email in order to achieve this MVP as I did not have access to an organization workspace)

### Step-by-Step Guide

1. **Create a Google Cloud Project**
   - Go to https://console.cloud.google.com/
   - Click "Select a project" → "New Project"
   - Give your project a name and create it

2. **Enable Google Calendar API**
   - In the project dashboard, go to "APIs & Services" → "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure the OAuth consent screen:
     - Choose "External" user type
     - Fill in app name, user support email
   - Create OAuth Client ID:
     - Application type: "Web application"
     - Name: Your app name
     - **Authorized redirect URIs**: `http://localhost:3010/auth/google`
   
4. **Save Your Credentials**
   - Copy the Client ID and Client Secret and Google redirect URI
   - Add them to your `.env` file

5. **Add Yourself as Test User**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Click on "Test users" section
   - Click "Add users"
   - Enter your Gmail address
   - Click "Add"
   - ⚠️ **This is critical**: For the testing phase, you MUST add yourself as a test user in the OAuth consent screen, otherwise authentication will fail with "access_denied"

### Critical Implementation Notes

⚠️ **Important**: The Calendar API callback expects your redirect URI to be implemented in your controller. You need to create this endpoint in your app to finalize the Google OAuth callback (it does this automatically, but you need to add the logic for adding the refresh_token and access_token to your oAuth2Client instance in order to further create calendar events).

**My redirect URI**: `http://localhost:3010/auth/google`

Once the endpoint was implemented and I added the logic for the refresh_token and access_token, the implementation went smoothly. 

6. **Installed `open` Package for Automatic Window Opening**
   - in order to not have a tedious debugging session while testing, I added the open package that redirects to the authentication browser, for an easier experience.


### Environment Variables Required
```env
GOOGLE_CLIENT_ID=your_client_id_from_console
GOOGLE_CLIENT_SECRET=your_client_secret_from_console
GOOGLE_REDIRECT_URI=http://localhost:3010/auth/google
```

