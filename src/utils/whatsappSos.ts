/**
 * SentriX Emergency WhatsApp Dispatch Engine
 * Dedicated direct emergency dispatch line: +91 7806869597 (917806869597)
 */

export const EMERGENCY_WHATSAPP_NUMBER = '917806869597';
export const EMERGENCY_WHATSAPP_DISPLAY = '+91 7806869597';

export interface EmergencySosPayload {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
  batteryLevel?: number | null;
  incidentType?: string;
  customNote?: string;
  incidentCode?: string;
}

/**
 * Generate formatted mission-critical distress text for WhatsApp
 */
export function formatEmergencyDistressMessage(payload: EmergencySosPayload): string {
  const {
    latitude,
    longitude,
    address = 'Live Coordinate Fix (SentriX Satellite Lock)',
    accuracy = 5,
    batteryLevel,
    incidentType = 'LIFE-THREATENING EMERGENCY DISTRESS',
    customNote,
    incidentCode,
  } = payload;

  const latFixed = latitude.toFixed(5);
  const lonFixed = longitude.toFixed(5);
  const mapsLink = `https://maps.google.com/?q=${latFixed},${lonFixed}`;
  const now = new Date();
  const timeFormatted =
    now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) +
    ' ' +
    now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

  return [
    `🚨 *SENTRIX CRITICAL EMERGENCY SOS* 🚨`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `⚠️ *IMMEDIATE RESCUE DISPATCH REQUIRED*`,
    incidentCode ? `🔖 *Incident Code:* \`${incidentCode}\`` : '',
    `🎯 *Emergency Type:* *${incidentType.toUpperCase()}*`,
    ``,
    `📍 *Live GPS Coordinates:*`,
    `• Lat: ${latFixed}, Lon: ${lonFixed} (Accuracy: ±${accuracy}m)`,
    `🗺️ *Clickable Google Maps Pin:*`,
    `${mapsLink}`,
    ``,
    `🏢 *Location / Landmark:*`,
    `${address}`,
    ``,
    batteryLevel !== undefined && batteryLevel !== null
      ? `🔋 *Device Battery Level:* ${batteryLevel}%`
      : '',
    `🕒 *Alert Timestamp:* ${timeFormatted} IST`,
    ``,
    `📢 *Distress Dispatch Note:*`,
    `"${customNote || 'Citizen in critical situation. Please mobilize nearest first responders, ambulance, or rescue units immediately!'}"`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🛡️ *SentriX Defense Network* — Emergency WhatsApp Desk: ${EMERGENCY_WHATSAPP_DISPLAY}`,
  ]
    .filter(line => line !== '')
    .join('\n');
}

/**
 * Construct direct WhatsApp URL targeting 7806869597
 * Compatible with mobile WhatsApp app and WhatsApp Web
 */
export function buildEmergencyWhatsAppUrl(message: string): string {
  const isMobile =
    typeof navigator !== 'undefined' &&
    /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  const encodedText = encodeURIComponent(message);

  if (isMobile) {
    return `https://wa.me/${EMERGENCY_WHATSAPP_NUMBER}?text=${encodedText}`;
  }
  return `https://web.whatsapp.com/send?phone=${EMERGENCY_WHATSAPP_NUMBER}&text=${encodedText}`;
}

/**
 * Direct 1-tap dispatch to WhatsApp 7806869597
 */
export function dispatchDirectEmergencyWhatsApp(payload: EmergencySosPayload): string {
  const message = formatEmergencyDistressMessage(payload);
  const url = buildEmergencyWhatsAppUrl(message);
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
  return url;
}
