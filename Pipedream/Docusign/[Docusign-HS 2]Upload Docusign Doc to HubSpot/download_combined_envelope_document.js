import { axios } from "@pipedream/platform";
import fs from "fs";

export default defineComponent({
  props: {
    docusign: {
      type: "app",
      app: "docusign",
    },
  },
  async run({ steps, $ }) {
    var args = {};
    let base_url = steps.get_base_url.$return_value.accounts[0].base_uri;
    let account_id = steps.get_base_url.$return_value.accounts[0].account_id;
    let envelope_id = steps.trigger.event.body.data.envelopeId;
    let envelope_url =
      steps.trigger.event.body.data.envelopeSummary.envelopeUri;
    let documents_combined_url =
      steps.trigger.event.body.data.envelopeSummary.documentsCombinedUri;
    let document_pdf_url =
      steps.trigger.event.body.data.envelopeSummary.envelopeDocuments[0].uri;
    let filename__ =
      steps.trigger.event.body.data.envelopeSummary.envelopeDocuments[0].name;
    args["filename"] = filename__;
    let base_path = base_url + "/restapi/v2.1/accounts/" + account_id;

    //construct get custom field url
    let doc_url = base_path + documents_combined_url;
    console.log(doc_url);

    var the_file = await axios($, {
      url: doc_url,
      responseType: "arraybuffer",
      headers: {
        Authorization: `Bearer ${this.docusign.$auth.oauth_access_token}`,
        "Content-Type": "application/pdf",
      },
    });

    console.log(the_file);

    fs.writeFileSync(`/tmp/${filename__}`, the_file);

    return args;
  },
});
