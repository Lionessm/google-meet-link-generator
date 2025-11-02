export interface CreateMeetingEventParams {
    summary: string;
    description: string;
    startDate: string;
    endDate: string;
    attendeesEmails?: string[];
}
  