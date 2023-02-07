import { axios } from "@pipedream/platform";
export default defineComponent({
  props: {
    financial_document_object_type_id: {
      type: "string",
      label: "Object type of Financial Document object",
      description: "Object type of Financial Document object i.e. 2-978832",
      optional: false,
    },
    financial_document_object_to_deal_assocation_id: {
      type: "string",
      label: "Association ID with Deal",
      description: "Assocation label ID for financial documents to deal",
      optional: false,
    },
    hubspot: {
      type: "app",
      app: "hubspot",
    },
  },
  async run({ steps, $ }) {
    //Functions
    //Get association
    const getAllAssociations = async (
      fromObjectType,
      fromObjectId,
      toObjectType
    ) => {
      var limit = 500;
      try {
        const apiResponse = await axios($, {
          url: `https://api.hubapi.com/crm/v3/objects/${fromObjectType}/${fromObjectId}/associations/${toObjectType}?limit=${limit}`,

          headers: {
            Authorization: `Bearer ${this.hubspot.$auth.oauth_access_token}`,
            "Content-Type": "application/json",
          },
        });
        console.log(JSON.stringify(apiResponse));
        return apiResponse.results[0].id;
      } catch (e) {
        e.message === "HTTP request failed"
          ? console.error(
              "Get all " + fromObjectType + " associated with " + fromObjectId,
              JSON.stringify(e.response, null, 2)
            )
          : console.error(
              "Get all " + fromObjectType + " associated with " + fromObjectId,
              e
            );
      }
    };

    //Make association
    const associate = async (
      object_type,
      object_id,
      to_object_id,
      to_object_type,
      association_type
    ) => {
      try {
        const apiResponse = await axios($, {
          url: `https://api.hubapi.com/crm/v3/objects/${object_type}/${object_id}/associations/${to_object_type}/${to_object_id}/${association_type}`,
          method: "put",
          headers: {
            Authorization: `Bearer ${this.hubspot.$auth.oauth_access_token}`,
            "Content-Type": "application/json",
          },
        });

        return apiResponse.id;
      } catch (e) {
        console.error(
          "Error: Associate " +
            object_type +
            "," +
            object_id +
            ", with " +
            to_object_type +
            "," +
            to_object_id +
            "on " +
            association_type
        );
        console.error(e.response);
      }
    };

    const check_ = async (the_inv_id, the_search_property, the_object_type) => {
      var body = {
        after: "",
        filterGroups: [
          {
            filters: [
              {
                operator: "EQ",
                propertyName: the_search_property,
                value: the_inv_id,
              },
            ],
          },
        ],

        properties: ["name", "hs_object_id", "xero_deal_id_error"],
        sorts: [
          {
            propertyName: "name",
            direction: "DESCENDING",
          },
        ],
        query: "",
      };

      try {
        console.log("searching...");
        const check_company_resp = await axios($, {
          url: `https://api.hubapi.com/crm/v3/objects/${the_object_type}/search`,
          method: "post",
          headers: {
            Authorization: `Bearer ${this.hubspot.$auth.oauth_access_token}`,
            "Content-Type": "application/json",
          },
          data: body,
        });

        if (check_company_resp.hasOwnProperty("total")) {
          if (check_company_resp.total !== 0) {
            console.log("----Found invoice");
            return [
              check_company_resp.results[0].id,
              check_company_resp.results[0].properties.xero_deal_id_error,
            ];
          } else if (check_company_resp.total === 0) {
            return [0];
          }
        } else {
          console.log("----Serious issue..." + check_company_resp);
        }
      } catch (error) {
        if (error.response) {
          if (error.response.status == 404) {
            return ["Not found"];
          }
        }
        console.log("----Search error:  Status is " + error);
      }
    };

    //Get labelled associations
    const get_associations = async (
      from_object_type,
      object_id,
      to_object_type
    ) => {
      // Get all memberships with properties

      try {
        const apiResponse = await axios($, {
          url: `https://api.hubapi.com/crm/v4/objects/${from_object_type}/${object_id}?associations=${to_object_type}&archived=false`,
          method: "get",
          headers: {
            Authorization: `Bearer ${this.hubspot.$auth.oauth_access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (apiResponse.hasOwnProperty("associations")) {
          if (apiResponse.associations.deals.results.length > 0) {
            return apiResponse.associations.deals.results[0].id;
          } else if (apiResponse.associations.deals.results.length == 0) {
            console.log("Result length is 0");
            return 0;
          }
        }
      } catch (error) {
        if (error.hasOwnProperty("message")) {
          if (error.message === "Request failed with status code 404") {
            console.log("404 response returned");
            return 0;
          }
        }

        console.dir(error);
      }
    };

    const create_and_associate_invoice = async (object_type, deal_id, data) => {
      //call hubspot create
      var create_inv;
      try {
        create_inv = await axios($, {
          method: "post",
          url: `https://api.hubapi.com/crm/v3/objects/${object_type}`,
          headers: {
            Authorization: `Bearer ${this.hubspot.$auth.oauth_access_token}`,
            "content-type": "application/json",
          },
          data: data,
        });
      } catch (error) {
        console.log("-----Error creating invoice on HubSpot");
        console.log(error);
      }

      //Set the association
      try {
        console.log("-----Setting the association...");
        var set_the_association;
        if (deal_id !== 0 && create_inv.id) {
          set_the_association = await set_association(create_inv.id, deal_id);
        } else {
          set_the_association = {
            no_deal_id_error: "No deal ID to associate with",
          };
        }

        var return_args = {
          set_association: JSON.stringify(set_the_association),
          create_inv: create_inv,
        };
        return return_args;
      } catch (error) {
        console.log("-----Error associating invoice on HubSpot");
        console.log(error);
      }
    };

    const set_association = async (object_type, inv_object_id, deal_id) => {
      console.log("-----Getting company id...");
      var company_id = await getAllAssociations("deal", deal_id, "0-2");
      console.log(company_id);

      //associate deal with inv
      console.log("----Associating invoice with deal...");
      var deal_inv_asso = await associate(
        object_type,
        inv_object_id,
        deal_id,
        "deal",
        "financial_document_to_deal"
      );

      if (company_id !== 0) {
        //associate company with inv
        console.log("----Associating invoice with company...");
        var company_inv_asso = await associate(
          object_type,
          inv_object_id,
          company_id,
          "0-2",
          "financial_document_to_company"
        );
      } else {
        console.log("No company ID");
      }
      var return_args = {
        deal_inv_asso: deal_inv_asso,
        company_inv_asso: company_inv_asso,
        company_id: company_id,
      };
      return return_args;
    };

    //Main

    let deal_id = steps.get_deal_id.$return_value;

    let inv_number =
      steps.get_invoice_details.$return_value.Invoices[0].InvoiceNumber;

    let task = steps.trigger.event.eventType;

    let object_type = this.financial_document_object_type_id;
    let ref_number =
      steps.get_invoice_details.$return_value.Invoices[0].Reference;

    let note_status = steps.get_invoice_status.$return_value;
    const fd_label_id = this.financial_document_object_to_deal_assocation_id;
    var reminder_days = steps.get_reminder_types_sent.$return_value;

    let data = {
      properties: {
        xero_invoice_number: inv_number,
        xero_due_amount:
          steps.get_invoice_details.$return_value.Invoices[0].AmountDue,
        xero_total: steps.get_invoice_details.$return_value.Invoices[0].Total,
        xero_due_date: new Date(
          steps.get_invoice_details.$return_value.Invoices[0].DueDateString
        ).getTime(),
        xero_send_date: new Date(
          steps.get_invoice_details.$return_value.Invoices[0].DateString
        ).getTime(),
        xero_status:
          note_status === 0
            ? steps.get_invoice_details.$return_value.Invoices[0].Status
            : note_status,
        xero_ref_number: ref_number ? ref_number : "No ref",
        xero_deal_id_error: deal_id == 0 ? "true" : "false",
        xero_invoice_id:
          steps.get_invoice_details.$return_value.Invoices[0].InvoiceID,
        xero_currency:
          steps.get_invoice_details.$return_value.Invoices[0].CurrencyCode,
        xero_invoice_reminder_sent:
          reminder_days !== null
            ? reminder_days + " days reminder sent"
            : "None",
      },
    };

    if (task === "CREATE") {
      console.log(task);
      //search for invoice id using invoice number
      let inv_hs_id = await check_(
        inv_number,
        "xero_invoice_number",
        object_type
      );

      if (inv_hs_id[0] === 0) {
        console.log("--Invoice does not exist");

        let create_inv = await create_and_associate_invoice(
          object_type,
          deal_id,
          data
        );

        return { create_inv: create_inv };
      } else {
        console.log(
          "This invoice has been previously created, with invoice number... " +
            inv_hs_id[0]
        );
        return $.flow.exit(
          "Ending workflow to avoid duplicate invoice creation"
        );
      }
    } else if (task == "UPDATE") {
      console.log(task);

      //search for invoice id using invoice number
      let inv_hs_id = await check_(
        inv_number,
        "xero_invoice_number",
        object_type
      );

      if (inv_hs_id[0] !== 0) {
        console.log("--Inv ID is " + inv_hs_id[0]);

        try {
          var update_inv = await axios($, {
            method: "patch",
            url: `https://api.hubapi.com/crm/v3/objects/${object_type}/${inv_hs_id[0]}`,
            headers: {
              Authorization: `Bearer ${this.hubspot.$auth.oauth_access_token}`,
              "content-type": "application/json",
            },
            data: data,
          });
          // update_inv.id
        } catch (error) {
          console.log("--Error updating invoice on HubSpot");
          return "Update Error";
        }
        //Check if it is associated
        try {
          var check_deal_association = await get_associations(
            object_type,
            inv_hs_id[0],
            "0-3"
          );

          console.log("--Check deal association is " + check_deal_association);
        } catch (error) {
          console.log("--Error checking deal association on HubSpot");
          return "Check deal error";
        }

        //Associate if it not associated

        if (check_deal_association === 0) {
          try {
            let set_the_asso = await set_association(
              object_type,
              inv_hs_id[0],
              deal_id
            );
            console.log(
              "--Setting the association..." + JSON.stringify(set_the_asso)
            );
          } catch (error) {
            console.log(
              "--Error associating unassociated invoice with a deal" + error
            );
            return "Association Error";
          }
        }
      }

      return { update_inv: update_inv, inv_hs_id: inv_hs_id };
    } else {
      console.log("This invoice is not on HubSpot. Creating now...");
      try {
        let create_inv = await create_and_associate_invoice(
          object_type,
          deal_id,
          data
        );
        console.log("--Created invoice" + create_inv);
      } catch (error) {
        console.log("--Error creating FD/invoice for existing Xero invoice");
        console.log(error);
      }
    }
  },
});
