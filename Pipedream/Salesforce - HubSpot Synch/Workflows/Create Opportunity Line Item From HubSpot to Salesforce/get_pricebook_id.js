import { axios } from "@pipedream/platform";
export default defineComponent({
  props: {
    salesforce_rest_api: {
      type: "app",
      app: "salesforce_rest_api",
    },
  },
  async run({ steps, $ }) {
    let soql_search_string = `
    SELECT 
      Id,
      SELECT
        Id,
        Name
      FROM
        PricebookEntry
      WHERE
        Name=
    FROM 
      Pricebook2 
    WHERE 
      IsStandard=true
    `;
    return await axios($, {
      url: `${
        this.salesforce_rest_api.$auth.instance_url
      }/services/data/v30.0/query/?q=${encodeURIComponent(soql_search_string)}`,
      headers: {
        Authorization: `Bearer ${this.salesforce_rest_api.$auth.oauth_access_token}`,
      },
    });
  },
});
