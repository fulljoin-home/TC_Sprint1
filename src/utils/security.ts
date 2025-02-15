// Input validation patterns
const UNSAFE_PATTERNS = [
  /{{.*}}/,  // Handlebars-style interpolation
  /{%.*%}/,  // Liquid/Jekyll-style interpolation
  /\$\{.*\}/, // Template literal interpolation
  /<script.*>.*<\/script>/i, // Script tags
  /javascript:/i, // JavaScript protocol
  /data:/i,  // Data URLs
  /vbscript:/i, // VBScript protocol
  /onclick/i, // Inline event handlers
  /onload/i,
  /onerror/i,
];

// Sensitive content patterns
const SENSITIVE_PATTERNS = [
  /password/i,
  /api[_-]?key/i,
  /secret/i,
  /token/i,
  /credential/i,
  /ssh[_-]?key/i,
  /private[_-]?key/i,
];

// Moderation patterns for inappropriate content
const INAPPROPRIATE_PATTERNS = [
  /\b(hack|exploit|attack|vulnerability)\b/i,
  /\b(sql injection|xss|csrf)\b/i,
  // Add more patterns as needed
];

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
}

export function validateInput(input: string): ValidationResult {
  // Check for empty or too long input
  if (!input.trim()) {
    return { isValid: false, reason: "Input cannot be empty" };
  }
  if (input.length > 2000) {
    return { isValid: false, reason: "Input is too long (max 2000 characters)" };
  }

  // Check for unsafe patterns
  for (const pattern of UNSAFE_PATTERNS) {
    if (pattern.test(input)) {
      return { 
        isValid: false, 
        reason: "Input contains potentially unsafe content" 
      };
    }
  }

  // Check for sensitive information
  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(input)) {
      return { 
        isValid: false, 
        reason: "Input may contain sensitive information" 
      };
    }
  }

  return { isValid: true };
}

export function moderateContent(input: string): ValidationResult {
  // Check for inappropriate content
  for (const pattern of INAPPROPRIATE_PATTERNS) {
    if (pattern.test(input)) {
      return { 
        isValid: false, 
        reason: "Input contains inappropriate content" 
      };
    }
  }

  return { isValid: true };
}

export function sanitizeInput(input: string): string {
  // Basic sanitization
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

// Rate limiting helper
const requestCounts = new Map<string, { count: number; timestamp: number }>();

export function checkRateLimit(identifier: string, limit: number = 50, windowMs: number = 60000): boolean {
  const now = Date.now();
  const userRequests = requestCounts.get(identifier);

  if (!userRequests || (now - userRequests.timestamp) > windowMs) {
    requestCounts.set(identifier, { count: 1, timestamp: now });
    return true;
  }

  if (userRequests.count >= limit) {
    return false;
  }

  userRequests.count++;
  return true;
} 