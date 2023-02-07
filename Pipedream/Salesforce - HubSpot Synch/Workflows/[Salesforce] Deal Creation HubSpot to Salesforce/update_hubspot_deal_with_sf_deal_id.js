// To use any npm package, just import it
import axios from "axios";

export default defineComponent({
  async run({ steps, $ }) {
    // update objects

    const update = async (json, id) => {
      const hub_url = "https://api.hubspot.com/crm/v3/objects/";

      const object_type = "DEALS";
      const req_url =
        hub_url + object_type + "/batch/update/?" + "hapikey=" + "13";
      var body = JSON.stringify({
        inputs: [
          {
            properties: json,
            id: id,
          },
        ],
      });

      try {
        const resp = await axios({
          method: "post",
          url: req_url,
          headers: {
            "Content-Type": "application/json",
          },
          data: body,
        });

        if (resp.data.results[0].hasOwnProperty("id")) {
          return resp.data.results[0].id;
        }
      } catch (error) {
        console.log("Error.....", error);
      }
    };

    if (
      steps.trigger.event.body.task === "create" &&
      steps.create_opportunity_on_salesforce.$return_value !== "0"
    ) {
      var upd_obj = {};

      upd_obj["salesforce_deal_id"] =
        steps.create_opportunity_on_salesforce.$return_value;
      upd_obj["last_sync_date"] = steps.trigger.event.body.last_modified_date;

      console.log("Updating on hubspot");
      var update_contact = await update(
        upd_obj,
        steps.trigger.event.body.deal_ID
      );
      if (typeof Number(update_contact) == "number") {
        console.log(update_contact);
        return update_contact;
      } else {
        console.log("Error, id is ", update_contact);
      }
    } else {
      console.log("This is not a create salesforce id job");
    }
  },
});
