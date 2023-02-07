import { axios } from "@pipedream/platform";
import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch";

export default defineComponent({
  props: {
    hubspot: {
      type: "app",
      app: "hubspot",
    },
  },
  async run({ steps, $ }) {
    let filename_ =
      steps.download_combined_envelope_document.$return_value.filename;
    let filepath = `/tmp/${filename_}`;
    console.log(filepath);

    const uploadFile = async (filepath, filename_) => {
      var URL = `https://api.hubapi.com/filemanager/api/v3/files/upload`;
      var fileOptions = {
        access: "PRIVATE",
        overwrite: false,
        duplicateValidationStrategy: "NONE",
        duplicateValidationScope: "EXACT_FOLDER",
      };
      const formData = new FormData();
      formData.append("file", fs.createReadStream(filepath));
      formData.append("fileName", "signed_complete_" + filename_ + ".pdf");
      formData.append("options", JSON.stringify(fileOptions));
      formData.append("folderPath", "/closed_won_signed_contracts/");
      // console.log(formData)
      try {
        const response = await fetch(URL, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${this.hubspot.$auth.oauth_access_token}`,
          },
        });
        const data = await response.json();
        return data;
      } catch (error) {
        console.log("Error - uploadFile()", error.status, error.message);
      }
    };

    let upload_pdf = await uploadFile(filepath, filename_);
    console.log("Upload pdf is " + upload_pdf);

    return upload_pdf;
  },
});
