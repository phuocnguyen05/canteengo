import { CanteenStatusConfig } from '../types';

export interface OperatingInterval {
  startMinutes: number; // e.g. 6*60 + 30 = 390
  endMinutes: number;   // e.g. 8*60 + 30 = 510
  label: string;        // e.g. "06:30 – 08:30"
}

/**
 * Extracts operating intervals (shifts) from lunchHours and breakfastHours.
 * If none parsed, falls back to standard canteen shifts.
 */
export function getOperatingIntervals(config?: CanteenStatusConfig): OperatingInterval[] {
  const intervals: OperatingInterval[] = [];
  const textToScan = `${config?.lunchHours || ''} ${config?.breakfastHours || ''}`;

  // Match patterns like "06:30 – 08:30" or "06:30 - 08:30" or "6:30 - 8:30"
  const regex = /(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/g;
  let match;

  while ((match = regex.exec(textToScan)) !== null) {
    const startH = parseInt(match[1], 10);
    const startM = parseInt(match[2], 10);
    const endH = parseInt(match[3], 10);
    const endM = parseInt(match[4], 10);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (startMinutes < endMinutes) {
      intervals.push({
        startMinutes,
        endMinutes,
        label: `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')} – ${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
      });
    }
  }

  // Fallback defaults if no valid intervals found
  if (intervals.length === 0) {
    intervals.push(
      { startMinutes: 6 * 60 + 30, endMinutes: 8 * 60 + 30, label: '06:30 – 08:30' },
      { startMinutes: 10 * 60 + 30, endMinutes: 13 * 60 + 30, label: '10:30 – 13:30' },
      { startMinutes: 16 * 60, endMinutes: 21 * 60, label: '16:00 – 21:00' }
    );
  }

  return intervals;
}

/**
 * Checks whether a specific date/time falls within operating shifts.
 * If config.isOpen === true (Đang mở cửa phục vụ), the store is considered OPEN!
 */
export function isWithinOperatingHours(
  targetDate: Date,
  config?: CanteenStatusConfig
): { isOpen: boolean; activeInterval?: OperatingInterval; allIntervals: OperatingInterval[] } {
  const allIntervals = getOperatingIntervals(config);

  // If admin explicitly has "Đang mở cửa phục vụ" enabled (config.isOpen === true),
  // then the store is OPEN!
  if (config && config.isOpen === true) {
    const minutes = targetDate.getHours() * 60 + targetDate.getMinutes();
    const active = allIntervals.find(
      (inv) => minutes >= inv.startMinutes && minutes <= inv.endMinutes
    );
    return {
      isOpen: true,
      activeInterval: active,
      allIntervals
    };
  }

  // If admin explicitly turned off the canteen (config.isOpen === false), it is closed
  if (config && config.isOpen === false) {
    return { isOpen: false, allIntervals };
  }

  // Default fallback if config not set: check shift hours
  const minutes = targetDate.getHours() * 60 + targetDate.getMinutes();
  const active = allIntervals.find(
    (inv) => minutes >= inv.startMinutes && minutes <= inv.endMinutes
  );

  return {
    isOpen: !!active,
    activeInterval: active,
    allIntervals
  };
}

export interface PickupValidationResult {
  isValid: boolean;
  error?: string;
  isClosed?: boolean;
  diffMinutes: number;
  pickupDate: Date;
}

/**
 * Validates the selected pickup time:
 * 1. Minimum 30 minutes from current time (để bếp chuẩn bị món)
 * 2. Within 24 hours from current time (chỉ nhận đơn trong 24h)
 * 3. Not during closed hours ("quán hiện đang tạm nghỉ")
 */
export function validatePickupTime(
  dayOption: 'TODAY' | 'TOMORROW',
  hourStr: string,
  minuteStr: string,
  config?: CanteenStatusConfig,
  now = new Date()
): PickupValidationResult {
  const hour = parseInt(hourStr || '0', 10);
  const minute = parseInt(minuteStr || '0', 10);

  // Build target Date
  const pickupDate = new Date(now);
  if (dayOption === 'TOMORROW') {
    pickupDate.setDate(pickupDate.getDate() + 1);
  }
  pickupDate.setHours(hour, minute, 0, 0);

  const diffMs = pickupDate.getTime() - now.getTime();
  const diffMinutesExact = diffMs / (60 * 1000);
  const diffMinutes = Math.round(diffMinutesExact);

  // Check 1: Past time
  if (diffMs < 0) {
    return {
      isValid: false,
      error: 'Khung giờ này đã trôi qua. Vui lòng chọn giờ sau thời điểm hiện tại trên 29 phút.',
      diffMinutes,
      pickupDate
    };
  }

  // Check 2: Minimum preparation time (must be > 29 minutes)
  if (diffMinutesExact <= 29) {
    return {
      isValid: false,
      error: 'Thời gian nhận tối thiểu phải trên 29 phút từ thời điểm hiện tại để bếp chuẩn bị món.',
      diffMinutes,
      pickupDate
    };
  }

  // Check 3: Only accept orders within 24 hours
  const max24hMs = 24 * 60 * 60 * 1000;
  if (diffMs > max24hMs) {
    return {
      isValid: false,
      error: 'Chỉ nhận đơn trong 24h so với giờ hiện tại.',
      diffMinutes,
      pickupDate
    };
  }

  // Check 4: If restaurant is closed during current time or pickup time
  // Check if store is manually closed
  if (config && config.isOpen === false) {
    return {
      isValid: false,
      isClosed: true,
      error: 'Quán hiện đang tạm nghỉ',
      diffMinutes,
      pickupDate
    };
  }

  // Check if target pickup time is outside operating shifts
  const targetCheck = isWithinOperatingHours(pickupDate, config);
  if (!targetCheck.isOpen) {
    return {
      isValid: false,
      isClosed: true,
      error: 'Quán hiện đang tạm nghỉ (khung giờ đã chọn nằm ngoài giờ mở cửa của quán)',
      diffMinutes,
      pickupDate
    };
  }

  // Also check if current order is placed while the canteen is closed right now
  const nowCheck = isWithinOperatingHours(now, config);
  if (!nowCheck.isOpen) {
    // If the canteen is closed RIGHT NOW, notify "Quán hiện đang tạm nghỉ"
    return {
      isValid: false,
      isClosed: true,
      error: 'Quán hiện đang tạm nghỉ',
      diffMinutes,
      pickupDate
    };
  }

  return {
    isValid: true,
    diffMinutes,
    pickupDate
  };
}

/**
 * Returns suggested earliest pickup time (now + 30 minutes rounded to nearest 5 minutes)
 */
export function getEarliestPickupOption(now = new Date()): {
  dayOption: 'TODAY' | 'TOMORROW';
  hour: string;
  minute: string;
  formatted: string;
} {
  const earliest = new Date(now.getTime() + 30 * 60 * 1000);
  // Round up to nearest 5 mins
  const remainder = earliest.getMinutes() % 5;
  if (remainder !== 0) {
    earliest.setMinutes(earliest.getMinutes() + (5 - remainder));
  }

  const isTomorrow = earliest.getDate() !== now.getDate();
  const hour = String(earliest.getHours()).padStart(2, '0');
  const minute = String(earliest.getMinutes()).padStart(2, '0');

  return {
    dayOption: isTomorrow ? 'TOMORROW' : 'TODAY',
    hour,
    minute,
    formatted: `${hour}:${minute}`
  };
}

/**
 * Normalizes any time string (including 12h AM/PM) into standardized 24h format (HH:mm or HH:mm:ss).
 * Examples:
 *  "05:30 PM" -> "17:30"
 *  "05:30:45 PM" -> "17:30:45"
 *  "08:15 AM" -> "08:15"
 *  "12:00 PM" -> "12:00"
 *  "12:30 AM" -> "00:30"
 *  "14:20" -> "14:20"
 */
export function normalizeTimeString24h(timeStr: string): string {
  if (!timeStr) return '';
  const trimmed = timeStr.trim();

  // Check if string contains AM or PM (case-insensitive)
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AaPp][Mm])$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2];
    const seconds = ampmMatch[3];
    const period = ampmMatch[4].toUpperCase();

    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }

    const hoursStr = String(hours).padStart(2, '0');
    return seconds ? `${hoursStr}:${minutes}:${seconds}` : `${hoursStr}:${minutes}`;
  }

  // Already 24h format or plain HH:mm / HH:mm:ss
  return trimmed;
}

/**
 * Formats a Date object or timestamp into 24-hour time string (HH:mm or HH:mm:ss).
 */
export function formatTime24h(dateInput?: Date | string | number, includeSeconds = false): string {
  if (!dateInput) {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    if (includeSeconds) {
      const s = String(now.getSeconds()).padStart(2, '0');
      return `${h}:${m}:${s}`;
    }
    return `${h}:${m}`;
  }

  if (typeof dateInput === 'string' && !dateInput.includes('T') && !dateInput.includes('-')) {
    // If it's already a time string, normalize to 24h
    return normalizeTimeString24h(dateInput);
  }

  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) {
    return String(dateInput);
  }

  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  if (includeSeconds) {
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }
  return `${h}:${m}`;
}

/**
 * Formats order created time and order date into unified 24h display:
 * Format: "HH:mm:ss - DD/MM/YYYY" or "HH:mm - DD/MM/YYYY"
 */
export function formatOrderDisplayDateTime(createdAt?: string, orderDate?: string): string {
  let rawTime = (createdAt || '').trim();
  let rawDate = (orderDate || '').trim();

  let datePart = '';
  let timePart = rawTime;

  // Handle if createdAt already has both date and time (e.g. "2026-09-17 14:30:00" or "14:30:00 17/09/2026")
  if (rawTime.includes(' ')) {
    const spaceSplit = rawTime.split(' ');
    const firstPart = spaceSplit[0];
    if (firstPart.includes('-')) {
      const dp = firstPart.split('-');
      if (dp.length === 3 && dp[0].length === 4) {
        datePart = `${dp[2].padStart(2, '0')}/${dp[1].padStart(2, '0')}/${dp[0]}`;
        timePart = spaceSplit.slice(1).join(' ');
      }
    } else if (firstPart.includes('/')) {
      datePart = firstPart;
      timePart = spaceSplit.slice(1).join(' ');
    } else if (spaceSplit[spaceSplit.length - 1].toUpperCase() === 'AM' || spaceSplit[spaceSplit.length - 1].toUpperCase() === 'PM') {
      // e.g. "05:51:37 PM"
      timePart = rawTime;
    }
  }

  // Normalize timePart into strict 24h format
  timePart = normalizeTimeString24h(timePart);

  if (!datePart) {
    if (!rawDate) {
      rawDate = new Date().toISOString().slice(0, 10);
    }
    if (rawDate.includes('-')) {
      const dp = rawDate.slice(0, 10).split('-');
      if (dp.length === 3) {
        datePart = `${dp[2].padStart(2, '0')}/${dp[1].padStart(2, '0')}/${dp[0]}`;
      }
    } else {
      datePart = rawDate;
    }
  }

  return timePart ? `${timePart} - ${datePart}` : datePart;
}
