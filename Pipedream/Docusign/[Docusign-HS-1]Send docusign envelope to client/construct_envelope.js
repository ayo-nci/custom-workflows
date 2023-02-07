// To use any npm package, just import it
// import axios from "axios"

export default defineComponent({
  async run({ steps, $ }) {
    let signee_array_ = steps.trigger.event.body.contact_props;
    let carbons_array_ = steps.trigger.event.body.carbon_props;
    let email_subject_ = steps.trigger.event.body.email_subject;

    let fileExtension = steps.download_pdf_file.$return_value[0][1];
    let fileName = steps.download_pdf_file.$return_value[0][0];
    let fileByte = steps.download_pdf_file.$return_value[2];

    let document_details = {
      fileExtension: steps.download_pdf_file.$return_value[0][1],
      fileName: steps.download_pdf_file.$return_value[0][0],
      fileByte: steps.download_pdf_file.$return_value[2],
    };

    function get_rep_array(h) {
      let sa = [];
      for (let y in h) {
        let tmp = {};
        tmp["email"] = h[y].properties.email;
        tmp["name"] =
          h[y].properties.firstname + " " + h[y].properties.lastname;
        tmp["recipientId"] = Number(y) + 1;
        tmp["routingOrder"] = Number(y) + 1;
        sa.push(tmp);
      }
      return sa;
    }

    function get_docs_array(document_details) {
      let sa = [];
      let tmp = {};
      tmp["documentBase64"] = document_details.fileByte;
      tmp["name"] = document_details.fileName;
      tmp["documentId"] = "1";
      tmp["fileExtension"] = document_details.fileExtension;
      sa.push(tmp);
      return sa;
    }

    let signee_array = get_rep_array(signee_array_);
    let carbons_array = get_rep_array(carbons_array_);
    let docs_array = get_docs_array(document_details);

    let env_o = {
      carbons_array: carbons_array, //[],
      docs_array: docs_array, // [],
      signers_array: signee_array,
      status: "sent",
      emailsubject: "Please sign document", //email_subject
    };

    return env_o;
  },
});
