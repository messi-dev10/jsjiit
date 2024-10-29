import { generate_date_seq, get_random_char_seq } from "./utils.js";

/**
 * @module Encryption
 */
/**
 * Encodes binary data to base64 string
 * @param {Uint8Array} data - Binary data to encode
 * @returns {string} Base64 encoded string
 */
export function base64Encode(data) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(data)));
}

/**
 * Decodes base64 string to binary data
 * @param {string} data - Base64 string to decode
 * @returns {Uint8Array} Decoded binary data
 */
export function base64Decode(data) {
  return Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
}

// Initialization Vector (IV)
const IV = new TextEncoder().encode("dcek9wb8frty1pnm");

/**
 * Generates an AES key based on date sequence
 * @param {Date} [date=null] - Optional date to use for key generation
 * @returns {Promise<CryptoKey>} Generated AES-CBC key
 */
export async function generate_key(date = null) {
  const dateSeq = generate_date_seq(date);
  const keyData = new TextEncoder().encode("qa8y" + dateSeq + "ty1pn");
  return window.crypto.subtle.importKey("raw", keyData, { name: "AES-CBC" }, false, ["encrypt", "decrypt"]);
}

/**
 * Generates an encrypted local name for request headers
 * @param {Date} [date=null] - Optional date to use for name generation
 * @returns {Promise<string>} Base64 encoded encrypted local name
 */
export async function generate_local_name(date = null) {
  const randomCharSeq = get_random_char_seq(4);
  const dateSeq = generate_date_seq(date);
  const randomSuffix = get_random_char_seq(5);
  const nameBytes = new TextEncoder().encode(randomCharSeq + dateSeq + randomSuffix);
  const encryptedBytes = await encrypt(nameBytes);

  return base64Encode(encryptedBytes);
}

/**
 * Encrypts data using AES-CBC
 * @param {Uint8Array} data - Data to encrypt
 * @returns {Promise<Uint8Array>} Encrypted data
 */
export async function encrypt(data) {
  const key = await generate_key();
  const encrypted = await window.crypto.subtle.encrypt({ name: "AES-CBC", iv: IV }, key, data);
  return new Uint8Array(encrypted);
}

/**
 * Decrypts data using AES-CBC
 * @param {Uint8Array} data - Data to decrypt
 * @returns {Promise<Uint8Array>} Decrypted data
 */
export async function decrypt(data) {
  const key = await generate_key();
  const decrypted = await window.crypto.subtle.decrypt({ name: "AES-CBC", iv: IV }, key, data);
  return new Uint8Array(decrypted);
}

/**
 * Deserializes an encrypted base64 payload
 * @param {string} payload - Base64 encoded encrypted payload
 * @returns {Promise<object>} Decrypted and parsed JSON object
 */
export async function deserialize_payload(payload) {
  const pbytes = base64Decode(payload);
  const raw = await decrypt(pbytes);
  return JSON.parse(new TextDecoder().decode(raw));
}

/**
 * Serializes and encrypts a payload object
 * @param {object} payload - Object to serialize and encrypt
 * @returns {Promise<string>} Base64 encoded encrypted payload
 */
export async function serialize_payload(payload) {
  const raw = new TextEncoder().encode(JSON.stringify(payload));
  const pbytes = await encrypt(raw);
  return base64Encode(pbytes);
}
