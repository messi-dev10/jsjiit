/**
 * @module Utils
 */
/**
 * Generates a date sequence string from a given date or current date
 * The sequence format is: d[0]m[0]y[0]w[0]d[1]m[1]y[1] where:
 * d = day padded to 2 digits
 * m = month padded to 2 digits
 * y = last 2 digits of year
 * w = weekday number (0-6)
 * @param {Date} [date=null] - Date object to generate sequence from. If null, uses current date
 * @returns {string} The generated date sequence string
 */
export function generate_date_seq(date = null) {
  if (date === null) {
    date = new Date();
  }
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed in JS
  const year = String(date.getFullYear()).slice(2);
  const weekday = String(date.getDay());

  return day[0] + month[0] + year[0] + weekday + day[1] + month[1] + year[1];
}

/**
 * Generates a random string of specified length using alphanumeric characters
 * @param {number} n - Length of random string to generate
 * @returns {string} Random string of length n containing alphanumeric characters
 */
export function get_random_char_seq(n) {
  const charset = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";

  for (let i = 0; i < n; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset[randomIndex];
  }

  return result;
}
