import { axios } from "@pipedream/platform";
export default defineComponent({
  props: {
    docusign: {
      type: "app",
      app: "docusign",
    },
  },
  async run({ steps, $ }) {
    return await axios($, {
      url: `https://account.docusign.com/oauth/userinfo`,
      headers: {
        Authorization: `Bearer ${this.docusign.$auth.oauth_access_token}`,
      },
    });
  },
});
