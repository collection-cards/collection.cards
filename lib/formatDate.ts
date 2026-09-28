export const formatDate = (
  input?: string | null,
  locale = 'en-US'
): string | null => {
  if (!input) return null
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return null
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  return date.toLocaleDateString(locale, options)
}
