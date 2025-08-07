import { formatDate } from './format-date.js';

// Mock Intl.DateTimeFormat globally
global.Intl = {
  DateTimeFormat: jest.fn().mockImplementation(() => {
    // Manual deterministic formatter to avoid timezone issues
    return {
      format: (date: Date) => {
        const pad = (n: number) => n.toString().padStart(2, '0');
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const months = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];

        const utcDay = date.getUTCDay();
        const dayOfWeek = days[utcDay === 0 ? 6 : utcDay - 1]; // ISO: Mon=0
        const day = pad(date.getUTCDate());
        const month = months[date.getUTCMonth()];
        const hour = pad(date.getUTCHours());
        const minute = pad(date.getUTCMinutes());

        return `${dayOfWeek}, ${day} ${month} ${hour}:${minute}`;
      },
    };
  }),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

describe('formatDate', () => {
  it('should format a valid ISO date string correctly', () => {
    const result = formatDate('2021-03-24T20:45:00.000Z');
    expect(result).toBe('Wed, 24 Mar 20:45');
  });

  it('should handle dates with +01:00 offset', () => {
    const result = formatDate('2021-03-24T20:45:00.000+01:00');
    expect(result).toBe('Wed, 24 Mar 19:45'); // UTC = 19:45
  });

  it('should handle -05:00 offset (e.g. EST)', () => {
    const result = formatDate('2021-03-24T20:45:00.000-05:00');
    expect(result).toBe('Thu, 25 Mar 01:45'); // UTC = 01:45 next day
  });

  it('should return empty string for invalid date string', () => {
    expect(formatDate('invalid-date')).toBe('');
    expect(formatDate('')).toBe('');
  });

  it('should return empty string for null or undefined', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatDateAsAny = formatDate as any;
    expect(formatDateAsAny(null)).toBe('');
    expect(formatDateAsAny(undefined)).toBe('');
  });

  it('should format midnight correctly', () => {
    const result = formatDate('2021-01-01T00:00:00.000Z');
    expect(result).toBe('Fri, 01 Jan 00:00');
  });
});
