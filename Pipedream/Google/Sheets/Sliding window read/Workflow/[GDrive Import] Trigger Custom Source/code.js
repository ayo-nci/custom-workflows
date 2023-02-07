// To use any npm package, just import it
import axios from "axios";

export default defineComponent({
  async run({ steps, $ }) {
    const send_to_custom_source = async (the_url, the_row) => {
      try {
        console.log("Sending row...");
        const resp = await axios.post(the_url, the_row);

        return resp.data;
      } catch (error) {
        console.log("Error sending is " + error);
      }
    };

    let custom_source_data = {
      file_url: steps.create_download_link.$return_value,
      file_name: steps.trigger.event.name,
      file_extension: steps.trigger.event.fullFileExtension,
      start_count: 0,
      end_count: 500,
    };

    let url = "m.pipedream.net";
    let new_sheet_length = 0;
    let loop = 0;
    do {
      // code block to be executed

      console.log("Loop is " + loop);

      var get_run_state = await send_to_custom_source(url, custom_source_data);
      console.log("get run state is ..." + JSON.stringify(get_run_state));

      var sheet_array_length = get_run_state["sheet_array_length"];
      var tmp_end_count = get_run_state["end_count"];
      custom_source_data["start_count"] = tmp_end_count;
      custom_source_data["end_count"] = tmp_end_count + 500;

      new_sheet_length = new_sheet_length + 500;
      loop = loop + 1;
      console.log("New sheet length is " + new_sheet_length);
    } while (sheet_array_length > new_sheet_length);
    // Reference previous step data using the steps object and return data to use it in future steps
    return loop;
  },
});
