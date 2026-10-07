export default class Iframe {
  constructor() {
    this.resolve = null;
    window.addEventListener("message", (e) => {
      const data = e.data;
      if (data.action) {
        switch (data.action) {
          case "interaction":
            this.resolve(data.interaction);
            break;
        }
      }
    });
  }
  async getInteraction() {
    window.parent.postMessage({ action: "getInteraction" }, "*");
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
      setTimeout(() => {
        reject({ error: "Timeout getting interaction" });
      }, 5000);
    });
  }
  close() {
    window.parent.postMessage({ action: "close" }, "*");
  }
  sent() {
    window.parent.postMessage({ action: "sent" }, "*");
  }
}
