import { axios } from "@pipedream/platform";
import fs from "fs";
import stream from "stream";
import { promisify } from "util";
//import fs from "fs";
import got from "got";

export default defineComponent({
  props: {
    hubspot: {
      type: "app",
      app: "hubspot",
    },
  },
  async run({ steps, $ }) {
    let attachment_file_id = steps.trigger.event.body.attachment_file_id;

    const get_file_details = async (file_id) => {
      const hub_url = "https://api.hubspot.com/files/v3/files/";

      const req_url = hub_url + file_id;

      console.log(req_url);
      try {
        console.log("here");
        var res = await axios($, {
          url: req_url,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer pat`,
          },
        });
        console.log(res);
        return [res.name, res.extension];
      } catch (error) {
        console.log("Error getting file with file id ", file_id, " is ", error);
      }
    };

    const get_signed_url = async (file_id) => {
      const hub_url = "https://api.hubspot.com/files/v3/files/";
      const req_url2 = hub_url + file_id + "/signed-url/?";

      try {
        var res = await axios($, {
          method: "GET",
          url: req_url2,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer pat-`,
          },
        });

        return res.url;
      } catch (error) {
        console.log(
          "Error getting signed url with file id ",
          file_id,
          " is ",
          error.response
        );
      }
    };

    let file_details = await get_file_details(attachment_file_id);

    let signed_file_url = await get_signed_url(attachment_file_id);

    console.log(
      JSON.stringify(file_details) + "\n" + JSON.stringify(signed_file_url)
    );

    let envelope_pdf = await axios($, {
      url: signed_file_url,
      responseType: "arraybuffer",
      headers: {
        Authorization: `Bearer ${this.hubspot.$auth.oauth_access_token}`,
      },
    });

    let tmp_file_path = "/tmp/" + file_details[0];

    fs.writeFileSync(tmp_file_path, envelope_pdf);

    return [file_details, tmp_file_path, envelope_pdf];
  },
});
