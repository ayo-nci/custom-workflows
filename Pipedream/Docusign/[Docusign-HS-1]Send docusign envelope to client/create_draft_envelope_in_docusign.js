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
    let base_path = base_url + "/restapi/v2.1/accounts/" + account_id;
    let create_envelope_url = `${base_path}/envelopes`;
    let env_objj = steps.construct_envelope.$return_value;

    function get_doc(doc_row) {
      let tmp = {};

      tmp["documentBase64"] = Buffer.from(doc_row.documentBase64).toString(
        "base64"
      );
      tmp["documentId"] = doc_row.documentId;
      tmp["fileExtension"] = doc_row.fileExtension;
      tmp["name"] = doc_row.name;

      return tmp;
    }

    function get_cc(cc_row, signee_count) {
      let tmp = {};

      tmp["email"] = cc_row.email;
      tmp["name"] = cc_row.name;
      tmp["recipientId"] = Number(cc_row.recipientId) + signee_count;
      tmp["routingOrder"] = Number(cc_row.recipientId) + signee_count;

      return tmp;
    }

    function get_signee(signer_row) {
      let tmp = {};

      tmp["email"] = signer_row.email;
      tmp["name"] = signer_row.name;
      tmp["recipientId"] = signer_row.recipientId;
      tmp["routingOrder"] = signer_row.recipientId;
      tmp["tabs"] = {
        signHereTabs: [
          {
            anchorString: `\s` + signer_row.recipientId + "sig",
            anchorUnits: "pixels",
            anchorXOffset: "0",
            anchorYOffset: "-5",
          },
        ],
        textTabs: [
          {
            anchorString: `\s` + signer_row.recipientId + "name",
            anchorUnits: "pixels",
            anchorXOffset: "0",
            anchorYOffset: "-5",
            bold: "false",
            font: "helvetica",
            fontSize: "size9",
            locked: "false",
            tabId: "legal_name",
            tabLabel: "Name",
          },
          {
            anchorString: `\s` + signer_row.recipientId + "date", //
            anchorUnits: "pixels",
            anchorXOffset: "0",
            anchorYOffset: "-5",
            bold: "false",
            font: "helvetica",
            fontSize: "size9",
            locked: "false",
            tabId: "signed_date",
            tabLabel: "Today's Date",
          },
        ],
      };

      return tmp;
    }

    function create_envelope(env_object, deal_id) {
      let cc = [];
      let docs = [];
      let signers = [];
      let reps = {};
      let envelope = {};
      let signee_count = env_object["signers_array"].length;

      //Add deal id in custom field i.e "customFields":
      let custom_field = {
        textCustomFields: [
          {
            name: "the_deal_id",
            required: "false",
            show: "true",
            value: deal_id,
          },
        ],
      };

      //Construct carbon copies
      for (let cc_row of env_object.carbons_array) {
        cc.push(get_cc(cc_row, signee_count));
      }
      //Construct documents
      for (let doc_row of env_object.docs_array) {
        docs.push(get_doc(doc_row));
      }
      //Construct signers
      for (let signer_row of env_object.signers_array) {
        signers.push(get_signee(signer_row));
      }

      //Construct recipients
      reps["carbonCopies"] = cc;
      reps["signers"] = signers;

      //Construct envelope
      envelope["documents"] = docs;
      envelope["recipients"] = reps;
      envelope["customFields"] = custom_field;

      return envelope;
    }
    let deal_id = steps.trigger.event.body.deal_id;
    let get_envelope = create_envelope(env_objj, deal_id);

    console.log(JSON.stringify(get_envelope));

    let envelope_data = await axios($, {
      method: "post",
      url: create_envelope_url,
      headers: {
        Authorization: `Bearer  ${this.docusign.$auth.oauth_access_token}`,
        "Content-Type": "application/json",
      },
      data: get_envelope,
    });

    return envelope_data;
  },
});
