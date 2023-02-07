// To use any npm package, just import it
import axios from "axios";

export default defineComponent({
  async run({ steps, $ }) {
    // get by unique identifier
    //Function verify email
    const check_email_in_hubspot = async (the_email_address) => {
      const hub_url = "https://api.hubspot.com/crm/v3/objects/";

      const object_type = "CONTACTS";
      const unique_identifier = "email";
      const enquiry_email = the_email_address;
      const req_url =
        hub_url +
        object_type +
        "/" +
        enquiry_email +
        "?idProperty=" +
        unique_identifier +
        "&hapikey=" +
        "13";

      try {
        const check_email_resp = await axios({
          method: "GET",
          url: req_url,
        });

        if (check_email_resp.data.hasOwnProperty("id")) {
          return [
            check_email_resp.data.id,
            check_email_resp.data.properties.lastmodifieddate,
          ];
        }
      } catch (error) {
        console.log("Error is", error.response);
        if (error.response.status == 404) {
          return ["Not found"];
        }
      }
    };
    if (steps.trigger.event.New.sync_status__c !== false) {
      console.log(
        "Checking hubspot for contact",
        steps.trigger.event.Old.Email
      );
      var contactID = await check_email_in_hubspot(
        steps.trigger.event.Old.Email
      );

      console.log("Contact id is ", contactID[0]);

      return contactID;
    } else {
      console.log("Stopping 2 way loop");
      return ["End"];
    }
  },
});
