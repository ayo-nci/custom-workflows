import { axios } from "@pipedream/platform";
export default defineComponent({
  props: {
    hubspot: {
      type: "app",
      app: "hubspot",
    },
  },
  async run({ steps, $ }) {
    let hub_owner_id = steps.get_deal.$return_value.properties.hubspot_owner_id;
    let docusign_pdf_id =
      steps.upload_pdf_to_hubspot.$return_value.objects[0].id;
    let note_props = {
      properties: {
        hs_timestamp: new Date(),
        hs_note_body: "Completed signed contract",
        hubspot_owner_id: hub_owner_id,
        hs_attachment_ids: docusign_pdf_id,
      },
    };

    let note_id = await axios($, {
      method: "post",
      url: `https://api.hubapi.com/crm/v3/objects/notes`, //
      headers: {
        Authorization: `Bearer ${this.hubspot.$auth.oauth_access_token}`,
      },
      data: note_props,
    });

    return note_id;
  },
});
