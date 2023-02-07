/*
'Creat contact' connector was not used for the following reasons
  1. When we receive a payload on the webhook, we need to know whether to update or create 
      a new record. Pipedream does not have conditional logic to address and branch workflows.
      Suggested work around is to use 'if (condition)' for each branch on a new code_step. Idea 
      being if the condition is met, the code will run.

  2. Fields shown in connector do not contain the 'Hubspot_ID' field 
      which needs to be updated with the hubspot ID before creating in Salesforce

As a result, the custom code is used here and the issue of whether to update 
or create a record is solved by using the Upsert API 
-------------------------------------
Upsert is a Salesforce conned word that combines 'insert' + 'update'. 
  Idea is to insert a record if a particular ID is not available 
  and if the ID is available, update the record instead.
  Read more here - 
  https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/dome_upsert.htm

We have an external id called 'Hubspot_ID'(internal name:'Hubspot_ID__c') which is the ID of 
the contact in Hubspot
*/

import { axios } from "@pipedream/platform";
export default defineComponent({
  props: {
    salesforce_rest_api: {
      type: "app",
      app: "salesforce_rest_api",
    },
  },
  async run({ steps, $ }) {
    // if ( steps.check_if_contact_exists.$return_value.totalSize == 0 )

    const composite_json = {
      //  "Name": steps.trigger.event.body.firstname + " " + steps.trigger.event.body.lastname,
      firstname: steps.trigger.event.body.firstname,
      lastname: steps.trigger.event.body.lastname,
      Email: steps.trigger.event.body.email,
      sync_status__c: false,
    };

    if (steps.trigger.event.body.sync_status !== "false") {
      var response = await axios($, {
        method: "patch",
        url:
          `${this.salesforce_rest_api.$auth.instance_url}/services/data/v30.0/sobjects/Contact/Hubspot_ID__c/` +
          steps.trigger.event.body.ID,
        headers: {
          Authorization: `Bearer ${this.salesforce_rest_api.$auth.oauth_access_token}`,
          "Content-Type": "application/json",
        },
        data: composite_json,
      });

      console.log(response);

      //Get salesforce_id for created contact and update contact on hubspot for a create job

      return response.id;
    } else {
      console.log("Sync status is " + steps.trigger.event.body.sync_status);
      console.log("Stopping 2 way loop");
    }
  },
});
