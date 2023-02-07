import { axios } from "@pipedream/platform";
export default defineComponent({
  props: {
    salesforce_rest_api: {
      type: "app",
      app: "salesforce_rest_api",
    },
  },
  async run({ steps, $ }) {
    if (steps.trigger.event.body.deal_contact_salesforce_id.salesforce_id) {
      let sf_id =
        steps.trigger.event.body.deal_contact_salesforce_id.salesforce_id;
      let soql_search_string = `
    SELECT 
      Id, 
      Name,
      (Select
        OpportunityId,
        ContactId
        From OpportunityContactRoles)
    FROM Contact
    WHERE Id = '${sf_id}'
    `;
      return await axios($, {
        url: `${
          this.salesforce_rest_api.$auth.instance_url
        }/services/data/v30.0/query/?q=${encodeURIComponent(
          soql_search_string
        )}`,
        headers: {
          Authorization: `Bearer ${this.salesforce_rest_api.$auth.oauth_access_token}`,
        },
      });
    } else {
      console.log("No salesforce ID was passed from HubSpot ...");
      return "NA";
    }
  },
});
