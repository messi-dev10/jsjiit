/**
 * @module JSJIIT
 */
// Import all classes
import { WebPortal, WebPortalSession } from "./wrapper.js";
import { AttendanceHeader, Semester, AttendanceMeta } from "./attendance.js";
import { Registrations } from "./registration.js";
import { ExamEvent } from "./exam.js";
import { APIError, LoginError, AccountAPIError, NotLoggedIn, SessionError, SessionExpired } from "./exceptions.js";

// Re-export everything
export {
  WebPortal,
  WebPortalSession,
  AttendanceHeader,
  Semester,
  AttendanceMeta,
  Registrations,
  ExamEvent,
  APIError,
  LoginError,
  SessionError,
  SessionExpired,
  AccountAPIError,
  NotLoggedIn,
};
