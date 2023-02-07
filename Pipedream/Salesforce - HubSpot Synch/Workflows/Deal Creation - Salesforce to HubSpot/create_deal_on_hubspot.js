// To use any npm package, just import it
import axios from "axios";

export default defineComponent({
  async run({ steps, $ }) {
    // create objects
    const create = async (objectType, prop_json) => {
      try {
        var response = await axios({
          method: "post",
          url: `https://api.hubapi.com/crm/v3/objects/${objectType}/batch/create?hapikey=13`,
          headers: {
            "Content-Type": "application/json",
          },
          data: {
            inputs: [
              {
                properties: prop_json,
              },
            ],
          },
        });
        console.log(response.data.results[0].id);

        if (!response.data.results[0].id) {
          console.log("No update");
          return null;
        } else if (response.data.results[0].id) {
          return response.data.results[0].id;
        }
      } catch (error) {
        console.log(error.response.data);
        return null;
      }
    };
    //To do, map stage names from salesforce to hubspot on HubDB
    //Main function
    var deal_json = {
      dealname: steps.trigger.event.New.Name,
      pipeline: "",
      dealstage: "appointmentscheduled",
      // "amount": ,
      dealtype: "newbusiness",
      salesforce_deal_id: steps.trigger.event.New.Id,
    };

    var create_deal = await create("DEALS", deal_json);

    return create_deal;
  },
});
