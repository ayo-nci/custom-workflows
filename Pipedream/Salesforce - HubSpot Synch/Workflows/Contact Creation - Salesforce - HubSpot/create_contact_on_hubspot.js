// To use any npm package, just import it
import axios from "axios";

export default defineComponent({
  async run({ steps, $ }) {
    //Function create
    const create = async (objectType, properties) => {
      const hub_url = "https://api.hubspot.com/crm/v3/objects/";

      const object_type = objectType;
      const req_url = hub_url + object_type + "?" + "hapikey=" + "13";

      try {
        const res = await axios.post(req_url, { properties: properties });
        if (res.data.hasOwnProperty("id")) {
          return res.data.id;
        }
      } catch (error) {
        console.error(
          "Error - create(" + objectType + "):",
          error.response.status,
          error.response.data
        );
      }
    };

    if (steps.check_contact_on_hubspot.$return_value === "Not found") {
      // create contact
      console.log("Contact does not exist");

      let def_email = steps.trigger.event.New.Id + "@salesforcetmp.com";

      //Compose contact properties using
      var contact_properties = {
        email: steps.trigger.event.New.Email
          ? steps.trigger.event.New.Email
          : def_email,
        firstname: steps.trigger.event.New.FirstName,
        lastname: steps.trigger.event.New.LastName,
        salesforce_id: steps.trigger.event.New.Id,
      };
      var contact_prop_json = [
        {
          properties: contact_properties,
        },
      ];

      console.log("Creating contact in hubspot...");
      var hubspot_contact_id = await create("CONTACTS", contact_properties);
    }

    return hubspot_contact_id;
  },
});
