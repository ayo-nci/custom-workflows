import { axios } from "@pipedream/platform";
export default defineComponent({
  props: {
    hubspot: {
      type: "app",
      app: "hubspot",
    },
  },
  async run({ steps, $ }) {
    let the_id = steps.trigger.event.body.Deleted.Hubspot_Line_Item_ID__c
      ? steps.trigger.event.body.Deleted.Hubspot_Line_Item_ID__c
      : null;
    let delete_line_item;

    if (the_id != null) {
      try {
        delete_line_item = await axios($, {
          url: `https://api.hubapi.com/crm/v3/objects/line_items/${the_id}`,
          method: "delete",
          headers: {
            Authorization: `Bearer ${this.hubspot.$auth.oauth_access_token}`,
          },
        });

        if (delete_line_item) {
          return delete_line_item;
        }
      } catch (error) {
        if (error.response.statusText === "Not Found") {
          console.log(
            "File not found... Msg --> \n" +
              JSON.stringify(error.response.data.message)
          );
        } else {
          console.log("Error deleting file... " + error.response);
        }
      }
    } else {
      console.log("No hubspot line item ID is found...");
    }

    if (delete_line_item) {
      console.log("deleted....");
      let { data } = delete_line_item;
      console.log(JSON.stringify(data));
    }

    if (delete_line_item == "") {
      console.log(
        "Delete successful for " +
          the_id +
          ". Resp: " +
          "[" +
          delete_line_item +
          "]"
      );
    } else {
      console.log("Delete not successful... " + "[" + delete_line_item + "]");
    }
  },
});
