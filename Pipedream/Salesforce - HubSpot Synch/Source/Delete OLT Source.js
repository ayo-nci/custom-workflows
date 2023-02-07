import http from "../../http.app.mjs";

export default {
  key: "http-new-requests-payload-only",
  name: "New Requests (Payload Only)",

  description: "Get a URL and emit the HTTP body as an event on every request",
  version: "0.1.1",
  type: "source",
  props: {
    httpInterface: {
      type: "$.interface.http",
      customResponse: true,
    },
    http,
  },
  async run(event) {
    const { body } = event;
    let the_line_item_id = body.hasOwnProperty("Deleted")
      ? body.Deleted.Id
      : "No ID Found";

    this.httpInterface.respond({
      status: 200,
      body,
    });
    // Emit the HTTP payload
    this.$emit(
      {
        body,
      },
      {
        summary: "Emitting... " + the_line_item_id,
      }
    );
  },
};
