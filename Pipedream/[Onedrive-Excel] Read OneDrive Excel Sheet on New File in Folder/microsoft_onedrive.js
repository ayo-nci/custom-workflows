import { axios } from "@pipedream/platform";
//import axios from "axios";
import fs from "fs";
import csv from "csvtojson";
import XLSX from "xlsx";

export default defineComponent({
  props: {
    microsoft_onedrive: {
      type: "app",
      app: "microsoft_onedrive",
    },
  },
  async run({ steps, $ }) {
    let item_id = steps.trigger.event.id;
    let filename = steps.trigger.event.name;
    let drive_id = steps.trigger.event.parentReference.driveId;
    let path = steps.trigger.event.parentReference.path;

    const get_excel_json = async (the_excel_filename) => {
      let excel_data = await fs.promises.readFile(`/tmp/${the_excel_filename}`);
      //  console.log("excel data is... " + excel_data)
      let fd = XLSX.read(excel_data, {
        type: "array",
        cellDates: true,
      });
      let first_sheet_name = fd.SheetNames[0];
      /* Get worksheet*/
      let worksheet = fd.Sheets[first_sheet_name];
      return XLSX.utils.sheet_to_json(worksheet, {
        raw: true,
      });
    };

    let file_batch = await axios($, {
      url: `https://graph.microsoft.com/v1.0/$batch`,
      method: "post",
      headers: {
        Authorization: `Bearer ${this.microsoft_onedrive.$auth.oauth_access_token}`,
      },
      data: {
        requests: [
          {
            id: "1",
            method: "GET",
            url: `/me/drive/items/${item_id}/content`,
          },
        ],
      },
    });

    if (
      file_batch.hasOwnProperty("responses") &&
      file_batch.responses[0].status == "302"
    ) {
      //  console.log("url is... " + file_batch.responses[0].headers.Location)
      let t_url = file_batch.responses[0].headers.Location;

      var the_file = await axios($, {
        url: t_url,
        method: "get",
        responseType: "arraybuffer",
      });
      console.log("The file is " + the_file);
    } else {
      console.log("Error getting signed url..." + file_batch);
    }

    let c = JSON.parse(JSON.stringify(the_file));
    //console.log(c.data)
    fs.writeFileSync(`/tmp/${filename}`, the_file);
    console.log("File saved locally");

    let sheetArray = await get_excel_json(filename);
    console.log("sheet array is " + sheetArray[0]);

    return sheetArray[0];
  },
});
