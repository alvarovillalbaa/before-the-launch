import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const blockedHostnamePatterns = [
  /^localhost$/i,
  /\.localhost$/i,
  /\.local$/i,
  /^0\.0\.0\.0$/,
];

function isPrivateIpv4(ip: string) {
  const parts = ip.split(".").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) return true;
  const [a, b] = parts;
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}

function isPrivateIpv6(ip: string) {
  const normalized = ip.toLowerCase();
  return (
    normalized === "::1" ||
    normalized === "::" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80") ||
    normalized.startsWith("::ffff:127.") ||
    normalized.startsWith("::ffff:10.") ||
    normalized.startsWith("::ffff:192.168.")
  );
}

export function normalizePublicHttpUrl(input: string) {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("Enter a valid URL.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  }

  if (url.username || url.password) {
    throw new Error("URLs with embedded credentials are not allowed.");
  }

  if (blockedHostnamePatterns.some((pattern) => pattern.test(url.hostname))) {
    throw new Error("Private or local network URLs are not allowed.");
  }

  const literalIpVersion = isIP(url.hostname);
  if (literalIpVersion === 4 && isPrivateIpv4(url.hostname)) {
    throw new Error("Private or local network URLs are not allowed.");
  }
  if (literalIpVersion === 6 && isPrivateIpv6(url.hostname)) {
    throw new Error("Private or local network URLs are not allowed.");
  }

  return url;
}

export async function assertPublicDnsTarget(url: URL) {
  const records = await lookup(url.hostname, { all: true, verbatim: true });
  if (records.length === 0) {
    throw new Error("The URL host could not be resolved.");
  }

  for (const record of records) {
    if (record.family === 4 && isPrivateIpv4(record.address)) {
      throw new Error("Private or local network URLs are not allowed.");
    }
    if (record.family === 6 && isPrivateIpv6(record.address)) {
      throw new Error("Private or local network URLs are not allowed.");
    }
  }
}
