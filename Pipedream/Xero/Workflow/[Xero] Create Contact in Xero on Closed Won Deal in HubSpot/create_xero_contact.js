import { axios } from "@pipedream/platform";
export default defineComponent({
  props: {
    xero_accounting_api: {
      type: "app",
      app: "xero_accounting_api",
    },
  },
  async run({ steps, $ }) {
    let contact_exist = steps.find_contact.$return_value.Contacts;

    let contact_data = {
      Contacts: [
        {
          Name: steps.trigger.event.body.company_details["Contact name"],
          FirstName: steps.trigger.event.body.contact_details["First name"],
          LastName: steps.trigger.event.body.contact_details["Last name"],
          EmailAddress: steps.trigger.event.body.contact_details.Email,
          DefaultCurrency: steps.trigger.event.body.deal_details.currency,
          AccountNumber:
            steps.trigger.event.body.company_details["Account number"],
          Website: steps.trigger.event.body.company_details.Website,
          Addresses: [
            {
              AddressType: "POBOX",
              AddressLine1: steps.trigger.event.body.company_details.Address,
              City: steps.trigger.event.body.company_details["Town/city"],
              PostalCode:
                steps.trigger.event.body.company_details["Postcode/Zip code"],
              Country: steps.trigger.event.body.company_details.Country,
              Region: steps.trigger.event.body.company_details["State/region"],
            },
          ],
          Phones: [
            {
              PhoneType: "DEFAULT",
              PhoneNumber: Number(
                steps.parse_phone_number.$return_value.number
              ),
              PhoneCountryCode: Number(
                steps.parse_phone_number.$return_value.countrycode
              ),
            },
          ],
        },
      ],
    };
    console.log(contact_exist);
    if (contact_exist.length === 0) {
      console.log("Creating new Xero contact...");

      let create_contact = await axios($, {
        url: `https://api.xero.com/api.xro/2.0/Contacts`,
        method: "post",
        headers: {
          Authorization: `Bearer ${this.xero_accounting_api.$auth.oauth_access_token}`,
          "xero-tenant-id": steps.get_xero_tenant_id.$return_value[0].tenantId,
        },
        data: contact_data,
      });

      return create_contact;
    } else {
      if (contact_exist.length > 0) {
        console.log(
          "This account number exists for Company: " + contact_exist[0].Name
        );
      }
    }
  },
});
