import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import open from 'open';
import { CreateMeetingEventParams } from './types/CreateMeetingEventParams.type';
import { MeetingEventResult } from './types/MeetingEventResult.type';

@Injectable()
export class AppService {
  private oAuth2Client: OAuth2Client;

  constructor() {
    this.oAuth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );
  }

  async getSessionToken(): Promise<void> {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;
  
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REDIRECT_URI) {
      throw new Error('Missing Google API credentials in environment variables');
    }
    const SCOPES = [
      'https://www.googleapis.com/auth/calendar',
    ];

    const authUrl = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline', // <-- important to get a refresh token
      scope: SCOPES,
      prompt: 'consent'
    });

    await open(authUrl, { app: { name: 'google chrome' } });
  }

  async getTokenFromCode(code: string): Promise<void> {
    const { tokens } = await this.oAuth2Client.getToken(code);

    // Set credentials on the instance OAuth2Client
    this.oAuth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });
  
    return;
  }

  async createMeetingEvent({
    summary,
    description,
    startDate,
    endDate,
    attendeesEmails = [],
  }: CreateMeetingEventParams): Promise<MeetingEventResult> {
    const calendar = google.calendar({ version: 'v3', auth: this.oAuth2Client });

    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary,
        description,
        start: { dateTime: startDate },
        end: { dateTime: endDate },
        attendees: attendeesEmails.map(email => ({ email })),
        conferenceData: {
          createRequest: { requestId: `${Date.now()}` }, // required for Meet
        },
      },
      conferenceDataVersion: 1,
    });


    return {
      summary: event.data.summary,
      start: event.data.start?.dateTime,
      meetLink: event.data.conferenceData?.entryPoints?.[0]?.uri,
    };
  }
}

export { MeetingEventResult };

