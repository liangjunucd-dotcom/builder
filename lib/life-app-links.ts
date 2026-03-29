/** Deep link / preview URL shown in QR for Aqara Life to open this Builder project on device. */
export function getLifeAppPreviewUrl(projectId: string): string {
  return `https://life.aqara.com/builder/preview?project=${encodeURIComponent(projectId)}`;
}

export function getLifeAppQrImageUrl(previewUrl: string, size = 168): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(previewUrl)}`;
}
