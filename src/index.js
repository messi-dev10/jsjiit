/**
 * @module JSJIIT
 */
// Import all classes
import { WebPortal, WebPortalSession, API, DEFCAPTCHA } from "./wrapper.js";
import { AttendanceHeader, Semester, AttendanceMeta } from "./attendance.js";
import { RegisteredSubject, Registrations } from "./registration.js";
import { ExamEvent } from "./exam.js";
import { APIError, LoginError, AccountAPIError, NotLoggedIn, SessionError, SessionExpired } from "./exceptions.js";
import {generate_local_name} from "./encryption.js";

// Re-export everything
export {
  WebPortal,
  WebPortalSession,
  API,
  DEFCAPTCHA,
  AttendanceHeader,
  Semester,
  AttendanceMeta,
  RegisteredSubject,
  Registrations,
  ExamEvent,
  APIError,
  LoginError,
  SessionError,
  SessionExpired,
  AccountAPIError,
  NotLoggedIn,
  generate_local_name,
};
