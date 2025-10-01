export function waybackMachineAdapter(document: Document, location: Location): string[] {
  if (!document || !location) return [];
  if (location.pathname.startsWith("/web/")) {
    const links = document.querySelectorAll<HTMLAnchorElement>('a[href^="magnet:"]');
    return Array.from(links, link => link.href);
  }
  return [];
};

// <a href="https://web.archive.org/web/20250226103720/magnet:/?xt=urn:btih:556f01abd19a6b6a19239e1fe9a5d67d39a685a8&amp;dn=Love.Hurts.2025.1080p.WEBRip.AAC5.1 [YTS]&amp;tr=udp%3A%2F%2Fopen.stealth.si%3A80%2Fannounce&amp;tr=udp%3A%2F%2Fexodus.desync.com%3A6969%2Fannounce&amp;tr=udp%3A%2F%2Ftracker.cyberia.is%3A6969%2Fannounce&amp;tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce&amp;tr=udp%3A%2F%2Ftracker.torrent.eu.org%3A451%2Fannounce&amp;tr=udp%3A%2F%2Fexplodie.org%3A6969%2Fannounce&amp;tr=udp%3A%2F%2Ftracker.birkenwald.de%3A6969%2Fannounce&amp;tr=udp%3A%2F%2Ftracker.moeking.me%3A6969%2Fannounce&amp;tr=udp%3A%2F%2Fipv4.tracker.harry.lu%3A80%2Fannounce&amp;tr=udp%3A%2F%2Ftracker.tiny-vps.com%3A6969%2Fannounce" role="button"><i class="glyphicon glyphicon-magnet" style="color:red;font-weight:500;font-size:medium;" title="magnet download"></i></a>