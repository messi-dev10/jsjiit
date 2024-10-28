/**
 * @module Exceptions
 */
/**
 * Error classes for handling various API and session-related exceptions
 * @class APIError
 * @extends {Error} Base JavaScript Error class
 * @param {string} message - Error message describing what went wrong
 * @description Base class for API-related errors. Thrown when there is a general API error that doesn't fit other categories.
 */
export class APIError extends Error {
  constructor(message) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Error classes for handling various API and session-related exceptions
 * @class LoginError
 * @extends {APIError} Base API error class
 * @param {string} message - Error message describing what went wrong
 * @description Error thrown during login attempts. Indicates authentication failed, invalid credentials, or other login-specific issues.
 */
export class LoginError extends APIError {
  constructor(message) {
    super(message);
    this.name = 'LoginError';
  }
}

/**
 * Error classes for handling various API and session-related exceptions
 * @class SessionError
 * @extends {Error} Base JavaScript Error class
 * @param {string} message - Error message describing what went wrong
 * @description Base class for session-related errors. Handles issues with user sessions and authentication state.
 */
export class SessionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SessionError';
  }
}

/**
 * Error classes for handling various API and session-related exceptions
 * @class SessionExpired
 * @extends {SessionError} Base session error class
 * @param {string} message - Error message describing what went wrong
 * @description Error thrown when the user's session has expired. Indicates the user needs to log in again to refresh their session.
 */
export class SessionExpired extends SessionError {
  constructor(message) {
    super(message);
    this.name = 'SessionExpired';
  }
}

/**
 * Error classes for handling various API and session-related exceptions
 * @class NotLoggedIn
 * @extends {SessionError} Base session error class
 * @param {string} message - Error message describing what went wrong
 * @description Error thrown when attempting authenticated operations without being logged in. Indicates the user needs to log in before accessing protected resources.
 */
export class NotLoggedIn extends SessionError {
  constructor(message) {
    super(message);
    this.name = 'NotLoggedIn';
  }
}

/**
 * Error classes for handling various API and session-related exceptions
 * @class AccountAPIError
 * @extends {Error} Base JavaScript Error class
 * @param {string} message - Error message describing what went wrong
 * @description Error thrown during account management operations. Handles errors related to account actions like password changes.
 */
export class AccountAPIError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AccountAPIError';
  }
}
