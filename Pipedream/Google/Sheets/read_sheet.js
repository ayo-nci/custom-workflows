import axios from "axios";
import fs from "fs";
import XLSX from "xlsx";
import csv from "csvtojson";

export default {
  name: "New Read Sheet",
  version: "0.0.5",
  key: "read-sheet",
  description: "Emit new events on each...",
  props: {
    file_URL: {
      type: "string",
      label: "File URL",
      description: "URL for the file is hosted",
    },

    http: {
      type: "$.interface.http",
      customResponse: true,
    },
  },
  type: "source",
  methods: {},
  async run(event) {
    //Functions
    //Parse excel data (first_sheet_only)
    const get_excel_json = async (the_excel_filename) => {
      let excel_data = await fs.promises.readFile(`/tmp/${the_excel_filename}`);
      let fd = XLSX.read(excel_data, {
        type: "array",
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

    let filename = event.body["file_name"];
    let extension = event.body["file_extension"];
    let date_now = await get_date();

    fs.writeFileSync(`/tmp/${filename}`, the_file.data);
    console.log("File saved locally");
    console.log(`Found ${extension} file... Name: ${filename}`);
    if (extension == "csv") {
      const csvArray = await csv().fromFile(`/tmp/${filename}`);
      csvArray.forEach((row) => {
        this.$emit(row, {
          summary: "Emitting... " + date_now,
        });
      });
    } else if (extension == "xlsx" || extension === "xls") {
      const excelArray = await get_excel_json(filename);
      excelArray.forEach((row) => {
        this.$emit(row, {
          summary: "Emitting... " + date_now,
        });
      });
    } else {
      console.log(`Unknown extension... -${extension}-`);
      console.log(typeof extension);
      console.log(extension.length);
    }

    this.http.respond({
      status: 200,
      body: "Payload received",
      headers: {
        "Content-Type": event.headers["Content-Type"],
      },
    });
  },
};
