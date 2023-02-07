// To use any npm package, just import it
// import axios from "axios"
import axios from "axios";

import hubspot from "@hubspot/api-client";

export default defineComponent({
  async run({ steps, $ }) {
    const hubspotClient = new hubspot.Client({
      apiKey: process.env.Ayo_hapi_key,
    });

    //Create function

    const create = async (objectType, properties) => {
      const hub_url = "https://api.hubspot.com/crm/v3/objects/";
      const hapi_key = process.env.Ayo_hapi_key;
      const object_type = objectType;
      const req_url = hub_url + object_type + "?" + "hapikey=" + hapi_key;

      try {
        const res = await axios.post(req_url, { properties: properties });
        if (res.data.hasOwnProperty("id")) {
          return res.data.id;
        }
      } catch (error) {
        console.error(
          "Error - create(" + objectType + "):",
          error.response.status,
          error.response.data
        );
      }
    };

    //Associate function
    const associate = async (
      fromObjectType,
      fromObjectID,
      toObjectType,
      toObjectID,
      associationType
    ) => {
      const hub_url = "https://api.hubspot.com/crm/v3/objects/";
      const hapi_key = process.env.Ayo_hapi_key;
      const req_url =
        hub_url +
        fromObjectType +
        "/" +
        fromObjectID +
        "/associations/" +
        toObjectType +
        "/" +
        toObjectID +
        "/" +
        associationType +
        "/?hapikey=" +
        hapi_key;

      try {
        const res = await axios({
          method: "put",
          url: req_url,
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (res.data.hasOwnProperty("id")) {
          return res.data.id;
        }
      } catch (error) {
        console.log("Error is ", error.response);
      }
    };

    const get_upload_file = async (file_name, folder_id, file_url) => {
      const hub_url =
        "https://api.hubapi.com/files/v3/files/import-from-url/async?";
      const hapi_key = process.env.Ayo_hapi_key;
      const req_url = hub_url + "hapikey=" + hapi_key;

      var file_json = {
        access: "PRIVATE",
        name: file_name,
        url: file_url,
        folderId: folder_id,
        duplicateValidationStrategy: "NONE",
        duplicateValidationScope: "ENTIRE_PORTAL",
        overwrite: false,
      };

      try {
        const res = await axios.post(req_url, file_json);
        if (res.data.hasOwnProperty("id")) {
          return res.data.id;
        }
      } catch (error) {
        console.log("Error uploading file is ", error.response.data.message);
      }
    };

    const get_check_file_upload_status = async (task_id) => {
      const hub_url =
        "https://api.hubapi.com/files/v3/files/import-from-url/async/tasks/";
      const hapi_key = process.env.Ayo_hapi_key;
      const req_url = hub_url + task_id + "/status?" + "hapikey=" + hapi_key;

      try {
        const res = await axios.get(req_url);
        if (res.data.result.hasOwnProperty("id")) {
          return res.data.result.id;
        }
      } catch (error) {
        console.log(
          "Error checking file upload status is ",
          error.response.data.message
        );
      }
    };

    const file_to_note = async (file_id) => {
      const hub_url = "https://api.hubspot.com/crm/v3/objects/notes/?";
      const hapi_key = process.env.Ayo_hapi_key;
      const req_url = hub_url + "hapikey=" + hapi_key;

      var note_json = {
        properties: {
          hs_timestamp: new Date().toISOString(),
          hs_note_body: "Attachment",
          hs_attachment_ids: file_id,
        },
      };

      try {
        const res = await axios.post(req_url, note_json);
        if (res.data.hasOwnProperty("id")) {
          return res.data.id;
        }
      } catch (error) {
        console.log(
          "Error creating note with file id ",
          file_id,
          " is ",
          error
        );
      }
    };

    function sleep(milliseconds) {
      const date = Date.now();
      let currentDate = null;
      do {
        currentDate = Date.now();
      } while (currentDate - date < milliseconds);
    }

    //Main

    const enquiry_status = steps.check_email_in_hubspot.$return_value;

    const broker_contact_email =
      steps.trigger.event.headers["return-path"].value[0].address;

    console.log("E S is", enquiry_status);

    var contact_id;
    if (enquiry_status == "Not found") {
      //Compose contact properties using email

      var contact_properties = {
        email: broker_contact_email,
        firstname: "James " + Math.random(),
        lastname: "Dough " + Math.random(),
      };

      var contact_prop_json = [
        {
          properties: contact_properties,
        },
      ];
      //Create contact on HubSpot and get contact ID
      var create_contact = await create("CONTACTS", contact_properties);
      console.log("cc is", create_contact);
      contact_id = create_contact;
    } else {
      contact_id = enquiry_status;
      console.log("Contact id", contact_id);
    }

    //Compose enquiry properties using
    var enquiry_properties = {
      type_of_space_required: "Officee1 " + Math.random(),
      location_of_interest: "London2 " + Math.random(),
    };
    var enquiry_prop_json = [
      {
        properties: enquiry_properties,
      },
    ];

    console.log("Creating enquiry...");
    var create_enquiry = await create("2-6678554", enquiry_properties);
    var enquiry_id = create_enquiry;
    console.log("Enquiry id", enquiry_id);

    //Associate enquiry with contact
    console.log("Associating enquiry with contact...");
    var enquiry_to_contact = await associate(
      "2-6678554",
      enquiry_id,
      "0-1",
      contact_id,
      "enquiry_to_contact"
    );
    console.log("Enq to c is ", enquiry_to_contact);

    if (steps.trigger.event.attachments) {
      const file_url = steps.trigger.event.attachments[0].contentUrl;
      const file_name = steps.trigger.event.attachments[0].filename;
      //Get folder id from folder already created inside root account: Done via postman
      const folder_id = "73780321315";

      //Call upload function, upload file and get returned file id
      console.log("Uploading attachment to file manager...");
      var task_file = await get_upload_file(file_name, folder_id, file_url);

      sleep(5000);

      //Check if file is done uploading to hubspot file manager by using task id in task_file
      console.log("Checking if attachment upload is succesful...");
      if (
        typeof Number(task_file) === "number" &&
        Number(task_file) !== 0 &&
        !isNaN(task_file)
      ) {
        var attached_file_id = await get_check_file_upload_status(task_file);
      } else {
        console.log("There is no task id to check");
      }

      //Add file to new note
      console.log("Creating note with attachment...");
      if (
        typeof Number(attached_file_id) === "number" &&
        Number(attached_file_id) !== 0 &&
        !isNaN(attached_file_id)
      ) {
        var add_file_to_note_id = await file_to_note(attached_file_id);
      } else {
        console.log("There is no file id check");
      }
      //associate note id with enquiry id
      console.log("Associating note with enquiry...");
      if (
        typeof Number(add_file_to_note_id) === "number" &&
        Number(add_file_to_note_id) !== 0 &&
        !isNaN(add_file_to_note_id)
      ) {
        var note_to_enquiry = await associate(
          "0-46",
          add_file_to_note_id,
          "2-6678554",
          enquiry_id,
          "enquiry_to_note"
        );
      } else {
        console.log("There is no note id to associate");
      }
      console.log("Association ID is :", note_to_enquiry);
    } else {
      console.log("There was no attachment in this run");
    }

    return steps.trigger.event;
  },
});
