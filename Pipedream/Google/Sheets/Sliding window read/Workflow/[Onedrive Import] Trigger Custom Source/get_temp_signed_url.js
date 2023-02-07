import { axios } from "@pipedream/platform";
//import axios from "axios";

export default defineComponent({
  props: {
    microsoft_onedrive: {
      type: "app",
      app: "microsoft_onedrive",
    },
  },
  async run({ steps, $ }) {
    let item_id = steps.trigger.event.id;
    let filename = steps.trigger.event.name;
    let drive_id = steps.trigger.event.parentReference.driveId;
    let path = steps.trigger.event.parentReference.path;

    let file_batch = await axios($, {
      url: `https://graph.microsoft.com/v1.0/$batch`,
      method: "post",
      headers: {
        Authorization: `Bearer ${this.microsoft_onedrive.$auth.oauth_access_token}`,
      },
      data: {
        requests: [
          {
            id: "1",
            method: "GET",
            url: `/me/drive/items/${item_id}/content`,
          },
        ],
      },
    });

    if (
      file_batch.hasOwnProperty("responses") &&
      file_batch.responses[0].status == "302"
    ) {
      var t_url = file_batch.responses[0].headers.Location;
    } else {
      console.log("Error getting signed url..." + file_batch);
    }

    return t_url;
  },
});
