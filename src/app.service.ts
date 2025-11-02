import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import open from 'open';
import { CreateMeetingEventParams } from './types/CreateMeetingEventParams.type';
import { MeetingEventResult } from './types/MeetingEventResult.type';
import { MEET_INVITE_TEMPLATE } from './config/emailTemplate';

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
      'https://www.googleapis.com/auth/gmail.send',
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


    const meetLink = event.data.conferenceData?.entryPoints?.[0]?.uri;
    const eventSummary = event.data.summary;
    const eventStart = event.data.start?.dateTime;

    // Send email to attendees if there are any
    if (attendeesEmails.length > 0 && meetLink) {
      await this.sendEmailWithMeetLink(attendeesEmails, eventSummary, meetLink);
    }

    return {
      summary: eventSummary,
      start: eventStart,
      meetLink,
    };
  }

  /**
   * Sends an email with the Google Meet link to attendees
   */
  private async sendEmailWithMeetLink(
    recipients: string[],
    eventTitle: string,
    meetLink: string,
  ): Promise<void> {
    const gmail = google.gmail({ version: 'v1', auth: this.oAuth2Client });

    const toField = recipients.join(', ');
    const subject = `Meeting Invitation: ${eventTitle}`;
    const body = MEET_INVITE_TEMPLATE(eventTitle, meetLink);

    const messageLines = [
      `To: ${toField}`,
      'Content-Type: text/plain; charset=UTF-8',
      `Subject: ${subject}`,
      '',
      body,
    ];

    const message = messageLines.join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    try {
      await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: encodedMessage },
      });
    } catch (error) {
      console.error('❌ Failed to send email:', error);
    }
  }
}

