// To use any npm package, just import it
import axios from "axios";

export default defineComponent({
  async run({ steps, $ }) {
    // create objects
    const associate = async (
      the_deal_id,
      the_contact_id,
      the_association_type
    ) => {
      try {
        var response = await axios({
          method: "put",
          url: `https://api.hubapi.com/crm/v3/objects/deals/${the_deal_id}/associations/contacts/${the_contact_id}/${the_association_type}?hapikey=13dfc51f-6c85-4688-9ae6-eec3eec6f6f3`,
          headers: {
            "Content-Type": "application/json",
          },
        });

        // console.log(response)

        if (!response.data) {
          console.log("No update");
          return null;
        } else if (response.data) {
          return response.data;
        }
      } catch (error) {
        console.log("Error is :" + error);
        return null;
      }
    };
    //To do, map stage names from salesforce to hubspot on HubDB
    //Main function

    var deal_id = steps.create_deal_on_hubspot.$return_value;
    var contact_id = steps.check_contact_on_hubspot.$return_value[0];

    if (deal_id !== null && contact_id !== null) {
      var associate_deal = await associate(
        deal_id,
        contact_id,
        "deal_to_contact"
      );
    } else {
      console.log(
        "Deal id is : " + deal_id + "and contact id is : " + contact_id
      );
    }
    return associate_deal;
  },
});
