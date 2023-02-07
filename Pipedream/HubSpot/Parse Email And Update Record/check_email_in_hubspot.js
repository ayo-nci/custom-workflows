// To use any npm package, just import it
import axios from "axios";

export default defineComponent({
  async run({ steps, $ }) {
    //prepare to call hubspot
    const hub_url = "https://api.hubspot.com/crm/v3/objects/";
    const hapi_key = "13";
    const object_type = "CONTACTS";
    const unique_identifier = "email";
    const enquiry_email =
      steps.trigger.event.headers["return-path"].value[0].address;

    const req_url = hub_url + object_type + "/" + enquiry_email + 
    "?idProperty=" + unique_identifier + "&hapikey=" + hapi_key;

    const check_email_in_hubspot = async (the_request_url) => {
      try {
        const check_email_resp = await axios({
          method: "GET",
          url: req_url,
        });

        if (check_email_resp.data.hasOwnProperty("id")) {
          return check_email_resp.data.id;
        }
      } catch (error) {
        if (error.response.status == 404) {
          return "Not found";
        }
      }
    };
    const does_email_exist = await check_email_in_hubspot(req_url);
    console.log(does_email_exist);
    return does_email_exist;
  },
});
