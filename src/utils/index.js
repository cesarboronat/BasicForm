import Iframe from "./iframe.js";
const iframe = new Iframe();

export function isEmpty(value) {
  if (value === null || value === undefined || value === "") {
    return true;
  }

  if (Array.isArray(value) && value.length === 0) {
    return true;
  }

  return false;
}
export function useIframe() {
  return iframe;
}
