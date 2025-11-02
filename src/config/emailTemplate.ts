export const MEET_INVITE_TEMPLATE = (eventTitle: string, meetLink: string) => `
🦄 Hello!

You're invited to a Google Meet session.

Topic: ${eventTitle}  
Join the meeting: ${meetLink}

We’re looking forward to seeing you there!

Best regards,  
Your Team
`.trim();