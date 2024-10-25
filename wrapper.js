class APIError extends Error {
  constructor(message) {
    super(message);
    this.name = "APIError";
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function __hit(method, url, options = {}, passed_headers= {}) {
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
    headers = { LocalName: localname }; // Assuming generateLocalName is defined elsewhere
  }

  // Merge provided headers with default headers
  if (options.headers) {
    options.headers = { ...options.headers, ...headers };
  } else {
    options.headers = headers;
  }
  console.log({
    method: method,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    body: options.body,
  });

  try {
    // Make the request using fetch
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: options.body,
    });

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
		LocalName: localname
	};
  }
}


async function get_attendance_meta(username, password) {
	ENDPOINT = "/StudentClassAttendance/getstudentInforegistrationforattendence"

	const session = await student_login(username, password);
	payload = {
		"clientid": session.clientid,
		"instituteid": session.instituteid,
		"membertype": session.membertype
	}

	const localname = await generateLocalName();
	let headers = session.getHeaders(localname);
	resp = await __hit("POST", API + ENDPOINT, { body: payload, authenticated: true }, headers);
	console.log("attendance meta");
	console.log(resp);
}