import { axios } from "@pipedream/platform";
export default defineComponent({
  props: {
    docusign: {
      type: "app",
      app: "docusign",
    },
  },
  async run({ steps, $ }) {
    let base_url = steps.get_base_url.$return_value.accounts[0].base_uri;
    let account_id = steps.get_base_url.$return_value.accounts[0].account_id;
    let envelope_id = steps.trigger.event.body.data.envelopeId;
    let envelope_url =
      steps.trigger.event.body.data.envelopeSummary.envelopeUri;
    let base_path = base_url + "/restapi/v2.1/accounts/" + account_id;

    //construct get custom field url
    let form_data_url = base_path + envelope_url + "/form_data";
    console.log(form_data_url);

    let form_data = await axios($, {
      url: form_data_url,
      headers: {
        Authorization: `Bearer ${this.docusign.$auth.oauth_access_token}`,
      },
    });

    let kk = form_data.formData.filter((x) => x.name == "Deal ID");
    let deal_id = kk[0].value;

    return deal_id;
  },
});
