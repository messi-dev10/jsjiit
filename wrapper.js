let session;
class APIError extends Error {
  constructor(message) {
    super(message);
    this.name = "APIError";
  }
}

function authenticated(method) {
  /**
   * @param {Function} method - A method of WebPortal class
   * @returns {Function} - A wrapper for the method with session validation checks
   */
  return function (...args) {
    if (this.session == null) {
      throw new NotLoggedIn();
    }

    // Uncomment this block if session expiry check is needed
    // if (this.session.expiry < new Date()) {
    //     throw new SessionExpired();
    // }

    return method.apply(this, args);
  };
}

async function __hit(method, url, options = {}, passed_headers = {}) {
  let exception = APIError; // Default exception

  // If an exception is provided in options, use that
  if (options.exception) {
    exception = options.exception;
    delete options.exception;
  }

  let headers;

  // Check if authentication is required
  if (options.authenticated) {
    console.log("headers needed");
    headers = passed_headers;
    delete options.authenticated;
  } else {
    let localname = await generateLocalName();
    headers = { LocalName: localname };
  }

  // Merge provided headers with default headers
  if (options.headers) {
    options.headers = { ...options.headers, ...headers };
  } else {
    options.headers = headers;
  }

  let fetchOptions = {
    method: method,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  if (options.json) {
    fetchOptions.body = JSON.stringify(options.json);
  } else {
    fetchOptions.body = options.body;
  }

  console.log(fetchOptions);

  try {
    // Make the request using fetch
    const response = await fetch(url, fetchOptions);

    // Convert the response to JSON
    const resp = await response.json();

    // Check for successful response status
    if (resp.status && resp.status.responseStatus !== "Success") {
      throw new exception(`status:\n${JSON.stringify(resp.status, null, 2)}`);
    }
    console.log(resp);
    return resp;
  } catch (error) {
    // Handle error
    throw new exception(error.message || "Unknown error");
  }
}

const API = "https://webportal.jiit.ac.in:6011/StudentPortalAPI";

const DEFCAPTCHA = { captcha: "phw5n", hidden: "gmBctEffdSg=" };

async function student_login(username, password, captcha = DEFCAPTCHA) {
  let pretoken_endpoint = "/token/pretoken-check";
  let token_endpoint = "/token/generate-token1";

  let payload = { username: username, usertype: "S", captcha: captcha };
  payload = await serializePayload(payload);

  let resp = await __hit("POST", API + pretoken_endpoint, { body: payload });

  let payload2 = resp["response"];
  delete payload2["rejectedData"];
  payload2["Modulename"] = "STUDENTMODULE";
  payload2["passwordotpvalue"] = password;
  payload2 = await serializePayload(payload2);

  let resp2 = await __hit("POST", API + token_endpoint, { body: payload2 });
  session = new WebPortalSession(resp2["response"]);
  return session;
}

class WebPortalSession {
  constructor(resp) {
    this.raw_response = resp;
    this.regdata = resp["regdata"];

    let institute = this.regdata["institutelist"][0];
    this.institute = institute["label"];
    this.instituteid = institute["value"];
    this.memberid = this.regdata["memberid"];
    this.userid = this.regdata["userid"];

    this.token = this.regdata["token"];
    let expiry_timestamp = JSON.parse(atob(this.token.split(".")[1]))["exp"];
    this.expiry = new Date(expiry_timestamp * 1000); // In JavaScript, Date expects milliseconds

    this.clientid = this.regdata["clientid"];
    this.membertype = this.regdata["membertype"];
    this.name = this.regdata["name"];
  }

  getHeaders(localname) {
    return {
      Authorization: `Bearer ${this.token}`,
      LocalName: localname,
    };
  }
}

async function get_attendance_meta(username, password) {
  ENDPOINT = "/StudentClassAttendance/getstudentInforegistrationforattendence";

  session = await student_login(username, password);
  payload = {
    clientid: session.clientid,
    instituteid: session.instituteid,
    membertype: session.membertype,
  };

  const localname = await generateLocalName();
  let _headers = session.getHeaders(localname);
  resp = await __hit("POST", API + ENDPOINT, { json: payload, authenticated: true }, _headers);
  console.log("attendance meta");
  console.log(resp);

  return new AttendanceMeta(resp["response"]);
}

async function get_attendance(header, semester) {

  const ENDPOINT = "/StudentClassAttendance/getstudentattendancedetail";

  const payload = {
    clientid: session.clientid,
    instituteid: session.instituteid,
    registrationcode: semester.registration_code,
    registrationid: semester.registration_id,
    stynumber: header.stynumber,
  };
  console.log("payload")
  console.log(payload);

  const localname = await generateLocalName();
  let _headers = session.getHeaders(localname);
  return __hit("POST", API + ENDPOINT, { json: payload, authenticated: true }, _headers)
    .then((resp) => resp.response)
    .catch((error) => {
      throw new APIError(error);
    });
}
