import http from "../../http.app.mjs";
import crypto from "crypto";

// Core HTTP component
export default {
  key: "http-new-requests",
  name: "New Requests",
  description:
    "Get a URL and emit the full HTTP event on every request (including headers and query parameters). You can also configure the HTTP response code, body, and more.",
  version: "0.1.1",
  type: "source",
  props: {
    xero_authToken: {
      type: "string",
      secret: true,
      label: "Xero shared secret",
      description:
        "Xero shared secret gotten from webhook app. Required for validating Xero payload.",
    },
    httpInterface: {
      type: "$.interface.http",
      customResponse: true,
    },
    emitBodyOnly: {
      type: "boolean",
      label: "Body Only",
      description:
        "This source emits an event representing the full HTTP request by default. Select `true` to emit the body only.",
      optional: true,
      default: false,
    },
    resStatusCode: {
      type: "string",
      label: "Response Status Code",
      description: "The status code to return in the HTTP response",
      optional: true,
      default: "200",
    },
    resContentType: {
      type: "string",
      label: "Response Content-Type",
      description:
        "The `Content-Type` of the body returned in the HTTP response",
      optional: true,
      default: "application/json",
    },
    resBody: {
      type: "string",
      label: "Response Body",
      description: "The body to return in the HTTP response",
      optional: true,
      default: '{ "success": true }',
    },
    http,
  },
  async run(event) {
    const summary = `${event.method} ${event.path}`;

    let bodyJson = event.bodyRaw;
    let xeroSignature = event.headers["x-xero-signature"];
    const sharedSecret = this.xero_authToken;
    const signature3 = crypto
      .createHmac("sha256", sharedSecret)
      .update(bodyJson.toString())
      .digest("base64");

    if (xeroSignature == signature3) {
      this.httpInterface.respond({
        status: 201,
      });

      if (this.emitBodyOnly) {
        this.$emit(event.body, {
          summary,
        });
      } else {
        //Get the set of events payload received from Xero payload and eject in foreach

        const event_payload = new Set(
          event.body.events.map((obj) => JSON.stringify(obj))
        );
        event_payload.forEach((event_) => {
          this.$emit(JSON.parse(event_), {
            summary,
          });
        });
      }
      console.log("201");
    } else {
      this.httpInterface.respond({
        status: 401,
      });
      console.log("401");
    }
  },
};
