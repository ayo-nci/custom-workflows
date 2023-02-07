// To use any npm package, just import it
import axios from "axios";

export default defineComponent({
  async run({ steps, $ }) {
    // update objects

    const update = async (json, id) => {
      const hub_url = "https://api.hubspot.com/crm/v3/objects/";
      const object_type = "CONTACTS";
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

    if (steps.check_contact_on_hubspot.$return_value[0] === "End") {
      console.log("Exiting...");
    } else if (
      steps.check_contact_on_hubspot.$return_value[0] !== "Not found"
    ) {
      var upd_obj = {};
      for (var prop in steps.get_updated_properties.$return_value) {
        upd_obj[
          steps.get_updated_properties.$return_value[prop].toLowerCase()
        ] =
          steps.trigger.event.New[
            steps.get_updated_properties.$return_value[prop]
          ];
      }
      //Put last_modified_date value of the contact into the last_synch_date during update
      upd_obj["last_sync_date"] =
        steps.check_contact_on_hubspot.$return_value[1];
      upd_obj["sync_status"] = false;

      console.log("Updating on hubspot");
      var update_contact = await update(
        upd_obj,
        steps.check_contact_on_hubspot.$return_value[0]
      );
      if (typeof Number(update_contact) == "number") {
        console.log(update_contact);
        return update_contact;
      } else {
        console.log(
          "Error, id is ",
          steps.check_contact_on_hubspot.$return_value[0]
        );
      }
    }
  },
});
