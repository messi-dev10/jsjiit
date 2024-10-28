class APIError extends Error {
  constructor(message) {
    super(message);
    this.name = 'APIError';
  }
}

class LoginError extends APIError {
  constructor(message) {
    super(message);
    this.name = 'LoginError';
  }
}

class SessionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SessionError';
  }
}

class SessionExpired extends SessionError {
  constructor(message) {
    super(message);
    this.name = 'SessionExpired';
  }
}

class NotLoggedIn extends SessionError {
  constructor(message) {
    super(message);
    this.name = 'NotLoggedIn';
  }
}

class AccountAPIError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AccountAPIError';
  }
}
