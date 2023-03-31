/** Gzip the build to check for gzip size. */
import { gzipSync } from "zlib";

export function zipBytes(bytes: Uint8Array) {
  const zippedBytes = gzipSync(bytes);
  return { buffer: zippedBytes, byteLength: zippedBytes.byteLength };
}
