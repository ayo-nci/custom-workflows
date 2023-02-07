import { axios } from "@pipedream/platform";
export default defineComponent({
  props: {
    hubspot: {
      type: "app",
      app: "hubspot",
    },
  },
  async run({ steps, $ }) {
    let note_id = steps.create_a_note_engagement.$return_value.id;
    let deal_id = steps.get_deal_id.$return_value;

    let note_to_deal_association = await axios($, {
      method: "put",
      url: `https://api.hubapi.com/crm/v3/objects/notes/${note_id}/associations/deal/${deal_id}/214`,
      headers: {
        Authorization: `Bearer ${this.hubspot.$auth.oauth_access_token}`,
        "Content-Type": "application/json",
      },
    });

    return note_to_deal_association;
  },
});
