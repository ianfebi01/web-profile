export const parseUrl = (url?: string | null): string => {
  if (!url) return '#'

  // If it's a relative path, mailto, tel, or already has a protocol, return as is
  if (
    url.startsWith('/') ||
    url.startsWith('#') ||
    url.startsWith('mailto:') ||
    url.startsWith('tel:') ||
    /^https?:\/\//i.test(url)
  ) {
    return url
  }

  // Handle common external domains that users might type without http://
  if (
    url.startsWith('wa.me/') ||
    url.startsWith('www.') ||
    url.includes('.com') ||
    url.includes('.id') ||
    url.includes('.net') ||
    url.includes('.org') ||
    url.includes('.io') ||
    url.includes('.co')
  ) {
    return `https://${url}`
  }

  // Fallback (might just be a broken relative path, but we prefix it just in case it was a typo for an external site vs internal)
  // Given Next.js defaults, if it doesn't look like a domain, we leave it as relative so it appends to current origin
  return url
}
