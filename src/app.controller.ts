import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateMeetingEventParams } from './types/CreateMeetingEventParams.type';
import { MeetingEventResult } from './types/MeetingEventResult.type';

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

  @Get('auth/google')
  async googleCallback(@Query('code') code: string): Promise<void> {
    return this.appService.getTokenFromCode(code);
  }
}

