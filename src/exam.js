/**
 * @module Exams
 */
export class ExamEvent {
  /**
   * Class containing exam event info
   * @param {string} exam_event_code - Code of the exam event
   * @param {number} event_from - Event from timestamp
   * @param {string} exam_event_desc - Description of the exam event
   * @param {string} registration_id - Registration ID
   * @param {string} exam_event_id - Exam event ID
   */
  constructor(exam_event_code, event_from, exam_event_desc, registration_id, exam_event_id) {
    this.exam_event_code = exam_event_code;
    this.event_from = event_from;
    this.exam_event_desc = exam_event_desc;
    this.registration_id = registration_id;
    this.exam_event_id = exam_event_id;
  }

  /**
   * Static method to create an ExamEvent from a JSON object
   * @param {object} resp - JSON object representing ExamEvent
   * @returns {ExamEvent} A new ExamEvent instance
   */
  static from_json(resp) {
    return new ExamEvent(
      resp["exameventcode"],
      resp["eventfrom"],
      resp["exameventdesc"],
      resp["registrationid"],
      resp["exameventid"]
    );
  }
}
