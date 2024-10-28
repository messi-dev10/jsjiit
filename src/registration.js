/**
 * @module Registration
 */
export class RegisteredSubject {
  /**
   * Class containing registered subject info like Lecturer name, credits, etc
   * @param {string} employee_name - Name of the employee/lecturer
   * @param {string} employee_code - Code of the employee
   * @param {string} minor_subject - Minor subject information
   * @param {string} remarks - Any remarks
   * @param {string} stytype - Style type
   * @param {number} credits - Number of credits
   * @param {string} subject_code - Code of the subject
   * @param {string} subject_component_code - Component code of the subject
   * @param {string} subject_desc - Description of the subject
   * @param {string} subject_id - ID of the subject
   * @param {string} audtsubject - Audit subject information
   */
  constructor(
    employee_name,
    employee_code,
    minor_subject,
    remarks,
    stytype,
    credits,
    subject_code,
    subject_component_code,
    subject_desc,
    subject_id,
    audtsubject
  ) {
    this.employee_name = employee_name;
    this.employee_code = employee_code;
    this.minor_subject = minor_subject;
    this.remarks = remarks;
    this.stytype = stytype;
    this.credits = credits;
    this.subject_code = subject_code;
    this.subject_component_code = subject_component_code;
    this.subject_desc = subject_desc;
    this.subject_id = subject_id;
    this.audtsubject = audtsubject;
  }

  /**
   * Static method to create a RegisteredSubject from a JSON object
   * @param {object} resp - JSON object representing RegisteredSubject
   * @returns {RegisteredSubject} A new RegisteredSubject instance
   */
  static from_json(resp) {
    return new RegisteredSubject(
      resp["employeename"],
      resp["employeecode"],
      resp["minorsubject"],
      resp["remarks"],
      resp["stytype"],
      resp["credits"],
      resp["subjectcode"],
      resp["subjectcomponentcode"],
      resp["subjectdesc"],
      resp["subjectid"],
      resp["audtsubject"]
    );
  }
}

export class Registrations {
  /**
   * Class containing all registered subjects and total course credits for the semester
   * @param {object} resp - JSON response object with registrations and total credits
   */
  constructor(resp) {
    this.raw_response = resp;
    this.total_credits = resp["totalcreditpoints"];
    this.subjects = resp["registrations"].map(RegisteredSubject.from_json);
  }
}
