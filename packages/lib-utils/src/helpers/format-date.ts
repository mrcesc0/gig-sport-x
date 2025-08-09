/**
 * Formats a date string into a human-readable, locale-based format.
 *
 * This function is designed to handle potentially invalid or null inputs gracefully.
 * If the input is `null`, `undefined`, or an invalid date string, it returns an empty string.
 *
 * ## Format Example:
 * Given a valid date string, the output format will be:
 * `"Sat, 10 Aug, 14:30"`
 *
 * The format is localized using the `'en-GB'` locale.
 */
export function formatDate(dateString: string): string {
  if (dateString == null) {
    return '';
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return '';
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  return new Intl.DateTimeFormat('en-GB', options).format(date);
}
