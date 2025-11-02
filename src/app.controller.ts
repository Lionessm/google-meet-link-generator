import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService, MeetingEventResult } from './app.service';
import { CreateMeetingEventParams } from './types/CreateMeetingEventParams.type';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post()
  createMeetingEvent(@Body() body: CreateMeetingEventParams): Promise<MeetingEventResult> {
    return this.appService.createMeetingEvent(body);
  }

  @Get('auth/google/refresh-token')
  async googleAuth() {
    return this.appService.getSessionToken();
  }

  // Used only for initial setup
  @Get('auth/google') // This is the URL that Google will redirect to after authorization
  async googleCallback(@Query('code') code: string): Promise<void> {
    return this.appService.getTokenFromCode(code);
  }
}

