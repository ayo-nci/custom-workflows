import axios from "axios";
import fs from "fs";
import XLSX from "xlsx";
import csv from "csvtojson";
import { sensitiveHeaders } from "http2";

export default {
  name: "New Read Sheet",
  version: "0.0.6",
  key: "read-sheet",
  description: "Emit new events on each...",
  props: {
    http: {
      type: "$.interface.http",
      customResponse: true,
    },
    db: "$.service.db",
  },
  type: "source",
  methods: {},
  async run(event) {
    //Functions

    const send_to_workflow = async (the_url, the_row) => {
      try {
        console.log("Sending row...");
        const resp = await axios.post(the_url, the_row);
        console.log("Sent..." + resp.data);

        return resp.data;
      } catch (error) {
        console.log("Error sending is " + error);
      }
    };

    //Parse excel data (first_sheet_only)
    const get_excel_json = async (the_excel_filename) => {
      let excel_data = await fs.promises.readFile(`/tmp/${the_excel_filename}`);
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

    //Parse date
    const get_date = async () => {
      const dateObj = new Date();
      let year = dateObj.getFullYear();
      let month = dateObj.getMonth();
      month = ("0" + month).slice(-2);
      // To make sure the month always has 2-character-formate. For example, 1 => 01, 2 => 02
      let date = dateObj.getDate();
      date = ("0" + date).slice(-2);
      // To make sure the date always has 2-character-formate
      let hour = dateObj.getHours();
      hour = ("0" + hour).slice(-2);
      // To make sure the hour always has 2-character-formate
      let minute = dateObj.getMinutes();
      minute = ("0" + minute).slice(-2);
      // To make sure the minute always has 2-character-formate
      let second = dateObj.getSeconds();
      second = ("0" + second).slice(-2);
      // To make sure the second always has 2-character-formate
      const timee = `${year}/${month}/${date} ${hour}:${minute}:${second}`;

      return timee;
    };

    const file_URL = event.body["file_url"];

    //Get the file from its file URL
    var the_file = await axios.get(file_URL, {
      responseType: "arraybuffer",
    });

    function get_workflow_url(the_file_name) {
      the_file_name = the_file_name.toLowerCase();
      let url;

      switch (true) {
        case the_file_name.includes("wholesaler"):
          url = "m.pipedream.net";
          break;
        case the_file_name.includes("ultherapy"):
          url = "m.pipedream.net";
          break;
        case the_file_name.includes("revive"):
          url = "m.pipedream.net";
          break;
        case the_file_name.includes("bocouture"):
          url = "m.pipedream.net";
          break;
        default:
          url = null;
          break;
      }

      return url;
    }

    //main

    let count = this.db.get("count") || 1;

    let filename = event.body["file_name"];
    let extension = event.body["file_extension"];
    let date_now = await get_date();
    const workflow_url = await get_workflow_url(filename);
    console.log("url is " + workflow_url);
    let start_count = event.body["start_count"];
    let end_count = event.body["end_count"];

    fs.writeFileSync(`/tmp/${filename}`, the_file.data);
    console.log("File saved locally");
    console.log(`Found ${extension} file... Name: ${filename}`);

    var sheetArray;

    //Get sheet data
    if (extension == "csv") {
      sheetArray = await csv().fromFile(`/tmp/${filename}`);
    } else if (extension == "xlsx" || extension == "xls") {
      sheetArray = await get_excel_json(filename);
    } else {
      console.log(`Unknown extension... -${extension}-`);
      console.log(typeof extension);
      console.log(extension.length);
    }

    let respond_json = {
      sheet_array_length: sheetArray.length,
      end_count: Number(end_count),
    };

    this.http.respond({
      status: 200,
      body: JSON.stringify(respond_json),
      headers: {
        "Content-Type": event.headers["Content-Type"],
      },
    });
    console.log("Number of rows..." + sheetArray.length);
    //Parse sheet data
    for (let count = start_count; count < end_count; count++) {
      console.log("Row range ... " + start_count + ":" + end_count);
      console.log("Row count" + count);

      if (sheetArray[count][0] !== null) {
        let row = sheetArray[count];
        await send_to_workflow(workflow_url, row);
        this.$emit([row, filename, extension], {
          summary:
            sheetArray.length + ` #${count} ` + "Emitting... " + date_now,
        });
      } else {
        console.log("Row is null");
      }
    }

    this.db.set("count", ++count);
  },
};
