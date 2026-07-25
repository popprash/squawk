/**
 * Checks if the given URL is an ImageKit URL.
 */
export function isImageKitUrl(url) {
  if (!url) return false;
  return url.includes("imagekit.io");
}

/**
 * Appends transformation parameters to an ImageKit URL.
 * Falls back to the original URL if not an ImageKit URL.
 */
export function withTransform(url, transform) {
  if (!url) return "";
  if (!isImageKitUrl(url)) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set("tr", transform);
    return parsed.toString();
  } catch (e) {
    return url;
  }
}
