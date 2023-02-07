import http from "../../http.app.mjs";
import axios from "axios";

// Core HTTP component
export default {
  key: "http-new-requests",
  name: "New Requests",
  description:
    "Get a URL and emit the full HTTP event on every request (including headers and query parameters). You can also configure the HTTP response code, body, and more.",
  version: "0.1.1",
  type: "source",
  props: {
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

    function get_workflow_url(content_type) {
      let url;

      switch (true) {
        case content_type === "publications":
          url = "m.pipedream.net";
          break;
        case content_type === "press":
          url = "m.pipedream.net";
          break;
        default:
          url = null;
          break;
      }

      return url;
    }

    this.httpInterface.respond({
      status: this.resStatusCode,
      body: this.resBody,
      headers: {
        "content-type": this.resContentType,
      },
    });

    //Throw error on favicon get request
    if (Object.keys(event.query).length == 0) throw new Error("No query");

    const the_url = get_workflow_url(event.query.content);

    if (this.emitBodyOnly) {
      let resp = await axios.post(the_url, event.query);
      console.log(JSON.stringify(resp.data));
      const summary = `${resp.data}`;

      this.$emit(event.query, {
        summary,
      });
    } else {
      let resp = await axios.post(the_url, event);
      const summary = `${resp.data}`;
      this.$emit(event, {
        summary,
      });
    }
  },
};
