// To use any npm package, just import it
import axios from "axios";

export default defineComponent({
  async run({ steps, $ }) {
    // update objects

    const update = async (json, id) => {
      const hub_url = "https://api.hubspot.com/crm/v3/objects/";

      const object_type = "CONTACTS";
      const req_url = hub_url + object_type + "/batch/update/";
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
            Authorization: `Bearer ${process.env.HUBSPOT_TOKEN}`,
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

    if (steps.trigger.event) {
      var upd_obj = {};

      upd_obj["salesforce_contact_id"] =
        steps.upsert_sales_force_contact.$return_value;

      console.log("Updating on hubspot");
      var update_contact = await update(upd_obj, steps.trigger.event.body.ID);
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
