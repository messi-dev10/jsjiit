const API = "https://webportal.jiit.ac.in:6011/StudentPortalAPI";
const DEFCAPTCHA = { captcha: "phw5n", hidden: "gmBctEffdSg=" };

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
    this.enrollmentno = this.regdata["enrollmentno"];
  }

  async get_headers() {
    const localname = await generate_local_name();
    return {
      Authorization: `Bearer ${this.token}`,
      LocalName: localname,
    };
  }
}

class WebPortal {
  constructor() {
    this.session = null;
  }
  async __hit(method, url, options = {}) {
    let exception = APIError; // Default exception
    if (options.exception) {
      exception = options.exception;
      delete options.exception;
    }

    let header;

    if (options.authenticated) {
      header = await this.session.get_headers(); // Assumes calling method is authenticated
      delete options.authenticated;
    } else {
      let localname = await generate_local_name();
      header = { LocalName: localname };
    }

    if (options.headers) {
      options.headers = { ...options.headers, ...header };
    } else {
      options.headers = header;
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
    try {
      console.log("fetching", url, "with options", fetchOptions);
      const response = await fetch(url, fetchOptions);
      const resp = await response.json();

      if (resp.status && resp.status.responseStatus !== "Success") {
        throw new exception(`status:\n${JSON.stringify(resp.status, null, 2)}`);
      }
      return resp;
    } catch (error) {
      throw new exception(error.message || "Unknown error");
    }
  }

  async student_login(username, password, captcha = DEFCAPTCHA) {
    let pretoken_endpoint = "/token/pretoken-check";
    let token_endpoint = "/token/generate-token1";

    let payload = { username: username, usertype: "S", captcha: captcha };
    payload = await serialize_payload(payload);

    let resp = await this.__hit("POST", API + pretoken_endpoint, { body: payload, exception: LoginError });

    let payload2 = resp["response"];
    delete payload2["rejectedData"];
    payload2["Modulename"] = "STUDENTMODULE";
    payload2["passwordotpvalue"] = password;
    payload2 = await serialize_payload(payload2);

    const resp2 = await this.__hit("POST", API + token_endpoint, { body: payload2, exception: LoginError });
    this.session = new WebPortalSession(resp2["response"]);
    return this.session;
  }

  async get_personal_info() {
    const ENDPOINT = "/studentpersinfo/getstudent-personalinformation";
    const payload = {
      clinetid: "SOAU",
      instituteid: this.session.instituteid,
    };
    const resp = await this.__hit("POST", API + ENDPOINT, { json: payload, authenticated: true });
    return resp["response"];
  }

  async get_student_bank_info() {
    const ENDPOINT = "/studentbankdetails/getstudentbankinfo";
    const payload = {
      instituteid: this.session.instituteid,
      studentid: this.session.memberid,
    };
    const resp = await this.__hit("POST", API + ENDPOINT, { json: payload, authenticated: true });
    return resp["response"];
  }

  async change_password(old_password, new_password) {
    const ENDPOINT = "/clxuser/changepassword";
    const payload = {
      membertype: this.session.membertype,
      oldpassword: old_password,
      newpassword: new_password,
      confirmpassword: new_password,
    };
    const resp = await this.__hit("POST", API + ENDPOINT, { json: payload, authenticated: true, exception: AccountAPIError });
    return resp["response"];
  }

  async get_attendance_meta() {
    const ENDPOINT = "/StudentClassAttendance/getstudentInforegistrationforattendence";

    const payload = {
      clientid: this.session.clientid,
      instituteid: this.session.instituteid,
      membertype: this.session.membertype,
    };

    const resp = await this.__hit("POST", API + ENDPOINT, { json: payload, authenticated: true });
    return new AttendanceMeta(resp["response"]);
  }

  async get_attendance(header, semester) {
    const ENDPOINT = "/StudentClassAttendance/getstudentattendancedetail";

    const payload = {
      clientid: this.session.clientid,
      instituteid: this.session.instituteid,
      registrationcode: semester.registration_code,
      registrationid: semester.registration_id,
      stynumber: header.stynumber,
    };

    const resp = await this.__hit("POST", API + ENDPOINT, { json: payload, authenticated: true });
    return resp["response"];
  }

  async get_subject_daily_attendance(semester, subjectid, individualsubjectcode, subjectcomponentids) {
    const ENDPOINT = "/StudentClassAttendance/getstudentsubjectpersentage";
    const payload = {
      cmpidkey: subjectcomponentids.map((id) => ({ subjectcomponentid: id })),
      clientid: this.session.clientid,
      instituteid: this.session.instituteid,
      registrationcode: semester.registration_code,
      registrationid: semester.registration_id,
      subjectcode: individualsubjectcode,
      subjectid: subjectid,
    };
    const resp = await this.__hit("POST", API + ENDPOINT, { json: payload, authenticated: true });
    return resp["response"];
  }

  async get_registered_semesters() {
    const ENDPOINT = "/reqsubfaculty/getregistrationList";

    const payload = {
      instituteid: this.session.instituteid,
      studentid: this.session.memberid,
    };
    const resp = await this.__hit("POST", API + ENDPOINT, { json: payload, authenticated: true });
    return resp["response"]["registrations"].map((i) => Semester.from_json(i));
  }

  async get_registered_subjects_and_faculties(semester) {
    const ENDPOINT = "/reqsubfaculty/getfaculties";
    const payload = {
      instituteid: this.session.instituteid,
      studentid: this.session.memberid,
      registrationid: semester.registration_id,
    };
    const resp = await this.__hit("POST", API + ENDPOINT, { json: payload, authenticated: true });
    return new Registrations(resp["response"]);
  }

  async get_semesters_for_exam_events() {
    //first, get the semesters that have exam events
    const ENDPOINT = "/studentcommonsontroller/getsemestercode-withstudentexamevents";
    const payload = {
      clientid: this.session.clientid,
      instituteid: this.session.instituteid,
      memberid: this.session.memberid,
    };
    const resp = await this.__hit("POST", API + ENDPOINT, { json: payload, authenticated: true });
    return resp["response"]["semesterCodeinfo"]["semestercode"].map((i) => Semester.from_json(i));
  }

  async get_exam_events(semester) {
    //then, get the exam events for the semester
    const ENDPOINT = "/studentcommonsontroller/getstudentexamevents";
    const payload = {
      instituteid: this.session.instituteid,
      registationid: semester.registration_id, // not a typo
    };

    const resp = await this.__hit("POST", API + ENDPOINT, { json: payload, authenticated: true });
    return resp["response"]["eventcode"]["examevent"].map((i) => ExamEvent.from_json(i));
  }

  async get_exam_schedule(exam_event) {
    //then, get the exam schedule for the exam event
    const ENDPOINT = "/studentsttattview/getstudent-examschedule";
    const payload = {
      instituteid: this.session.instituteid,
      registrationid: exam_event.registration_id,
      exameventid: exam_event.exam_event_id,
    };
    const resp = await this.__hit("POST", API + ENDPOINT, { json: payload, authenticated: true });
    return resp["response"];
  }

  async get_semesters_for_marks() {
    const ENDPOINT = "/studentcommonsontroller/getsemestercode-exammarks";
    const payload = {
      instituteid: this.session.instituteid,
      studentid: this.session.memberid,
    };
    const resp = await this.__hit("POST", API + ENDPOINT, { json: payload, authenticated: true });
    return resp["response"]["semestercode"].map((i) => Semester.from_json(i));
  }

  async download_marks(semester) {
    const ENDPOINT =
      "/studentsexamview/printstudent-exammarks/" +
      this.session.memberid +
      "/" +
      this.session.instituteid +
      "/" +
      semester.registration_id +
      "/" +
      semester.registration_code;
    const localname = await generate_local_name();
    let _headers = await this.session.get_headers(localname);
    const fetchOptions = {
      method: "GET",
      headers: _headers,
    };

    try {
      const resp = await fetch(API + ENDPOINT, fetchOptions);
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `marks_${semester.registration_code}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      throw new APIError(error);
    }
  }

  async get_semesters_for_grade_card() {
    const ENDPOINT = "/studentgradecard/getregistrationList";
    const payload = {
      instituteid: this.session.instituteid,
    };
    const resp = await this.__hit("POST", API + ENDPOINT, { json: payload, authenticated: true });
    return resp["response"]["registrations"].map((i) => Semester.from_json(i));
  }

  async __get_program_id() {
    const ENDPOINT = "/studentgradecard/getstudentinfo";
    const payload = {
      instituteid: this.session.instituteid,
    };
    const resp = await this.__hit("POST", API + ENDPOINT, { json: payload, authenticated: true });
    return resp["response"]["programid"];
  }

  async get_grade_card(semester) {
    const programid = await this.__get_program_id();
    const ENDPOINT = "/studentgradecard/showstudentgradecard";
    const payload = {
      branchid: this.session.branch_id,
      instituteid: this.session.instituteid,
      programid: programid,
      registrationid: semester.registration_id,
    };
    const resp = await this.__hit("POST", API + ENDPOINT, { json: payload, authenticated: true });
    return resp["response"];
  }

  async __get_semester_number() {
    const ENDPOINT = "/studentsgpacgpa/checkIfstudentmasterexist";
    const payload = {
      instituteid: this.session.instituteid,
      studentid: this.session.memberid,
      name: this.session.name,
      enrollmentno: this.session.enrollmentno,
    };
    const resp = await this.__hit("POST", API + ENDPOINT, { json: payload, authenticated: true });
    return resp["response"]["studentlov"]["currentsemester"];
  }

  async get_sgpa_cgpa() {
    const ENDPOINT = "/studentsgpacgpa/getallsemesterdata";
    const stynumber = await this.__get_semester_number();
    const payload = {
      instituteid: this.session.instituteid,
      studentid: this.session.memberid,
      stynumber: stynumber,
    };
    const resp = await this.__hit("POST", API + ENDPOINT, { json: payload, authenticated: true });
    return resp["response"];
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
    return method.apply(this, args);
  };
}

const authenticatedMethods = [
  'get_personal_info',
  'get_student_bank_info',
  'change_password',
  'get_attendance_meta',
  'get_attendance',
  'get_subject_daily_attendance',
  'get_registered_semesters',
  'get_registered_subjects_and_faculties',
  'get_semesters_for_exam_events',
  'get_exam_events',
  'get_exam_schedule',
  'get_semesters_for_marks',
  'download_marks',
  'get_semesters_for_grade_card',
  '__get_program_id',
  'get_grade_card',
  '__get_semester_number',
  'get_sgpa_cgpa'
];

authenticatedMethods.forEach(methodName => {
  WebPortal.prototype[methodName] = authenticated(WebPortal.prototype[methodName]);
});