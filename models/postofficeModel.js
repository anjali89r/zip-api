//customer.js
//a model scheme for our customer documents
import { dbcall } from "../libs/awsLib";
import { checkPinCodeServiceability } from "../libs/delhiveryApi";
const uuid = require("uuid");
const timestamp = new Date().toLocaleDateString();

export async function createrecord(params) {
  let postofficeModel = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: uuid.v1(),
      Pincode: params.Pincode,
      Postoffice: params.Postoffice,
      District: params.District,
      StateName: params.StateName,
      Serviceable: params.Serviceable,
      Servicearea: params.Servicearea,
      Servicecode: params.Servicecode,
      Codeligible: params.Codeligible,
      Shippingrate: params.Shippingrate,
      createdAt: timestamp,
    },
    ReturnValues: "ALL_OLD",
  };

  try {
    // console.log(postofficeModel);
    let resp = await dbcall("put", postofficeModel);
    // console.log("db call ", resp);
    return { status: "Success " + resp };
  } catch (ec) {
    console.log("Failure in updating the data ", ec);
    return {
      status: "Error in Updating customer info",
    };
  }
  // });
}

export async function getpostoffice(item, cartamount) {
  //console.log(cartamount);
  var params = {
    ExpressionAttributeValues: {
      ":s": item,
    },
    KeyConditionExpression: "Pincode = :s",
    IndexName: "pinindex",
    TableName: process.env.DYNAMODB_TABLE,
  };
  try {
    let dbresp = await dbcall("query", params);
    if (cartamount >= process.env.freeshippingamount) {
      dbresp.Items.map((element) => {
        element.Shippingrate = "0";
      });
    }
    console.log(dbresp);
    let delhiveryresp = await checkPinCodeServiceability(item, "");
    if (delhiveryresp != "Failed") {
      let codEligible = delhiveryresp.cod === "Y";
      dbresp.Items.map((element) => {
        element.Codeligible = codEligible;
      });
    }
    return dbresp.Items;
  } catch (e) {
    console.log("Failure in getting the data ", e);
    return {
      status: "Error in getting customer info",
    };
  }
}

export async function getShippingcost(req) {
  let response;
  if (req.country === "IN") {
    let params = {
      TableName: process.env.DYNAMODB_TABLE,
      ScanIndexForward: false,
      ConsistentRead: true,
      KeyConditionExpression: "#cd421 = :cd421 And #cd422 >= :cd422",
      ProjectionExpression:
        "#cd421,#postoffice,#district,#state,#cod,#serviceable, #rate, #country",
      ExpressionAttributeValues: {
        ":cd421": "p#" + req.postalCode,
        ":cd422": 0,
      },
      ExpressionAttributeNames: {
        "#cd421": "PK",
        "#cd422": "SK",
        "#postoffice": "Postoffice",
        "#district": "District",
        "#state": "State",
        "#cod": "CoD",
        "#serviceable": "Serviceable",
        "#rate": "Rate",
        "#country": "Country",
      },
    };
    try {
      let dbresp = await dbcall("query", params);
      if (req.cartAmount >= process.env.freeshippingamount) {
        dbresp.Items.map((element) => {
          element.shippingRate = "0";
        });
      }
      console.log(dbresp);
      if (dbresp.Items.length > 0) {
        let delhiveryresp = await checkPinCodeServiceability(
          req.postalCode,
          ""
        );
        if (delhiveryresp != "Failed") {
          let codEligible = delhiveryresp.cod === "Y";
          dbresp.Items.map((element) => {
            element.cod = codEligible;
          });
        }
      }
      if (dbresp.Items.length > 0) {
        response = dbresp.Items.map(function (row) {
          return {
            postCode: row.PK.replace("p#", ""),
            postOffice: row.Postoffice,
            district: row.District,
            state: row.State,
            country: row.Country,
            shippingRate: row.Rate,
            discountedShippingRate: row.shippingRate
              ? row.shippingRate
              : row.Rate,
            cod: row.CoD,
          };
        });
      }
      return response;
    } catch (e) {
      console.log("Failure in getting the data ", e);
      return {
        status: "Error in getting customer info",
      };
    }
  } else {
    let shippingCost = await getInternationalShippingCost(req);
    if (shippingCost) {
      response = [
        {
          postCode: "",
          postOffice: "",
          district: "",
          state: "",
          country: req.country,
          shippingRate: shippingCost,
          discountedShippingRate:
            req.cartAmount > 20000
              ? Math.round(shippingCost * 0.75)
              : shippingCost,
          cod: false,
        },
      ];
    } else {
      response = [
        {
          postCode: "",
          postOffice: "",
          district: "",
          state: "",
          country: req.country,
          shippingRate: 2500,
          discountedShippingRate: 2500,
          cod: false,
        },
      ];
    }

    return response;
  }
}

export async function getInternationalShippingCost(req) {
  let totalWeight = 0;
  let fueltax = 0;
  let gst = 0;
  let params = {
    TableName: process.env.DYNAMODB_TABLE,
    ScanIndexForward: false,
    ConsistentRead: true,
    KeyConditionExpression: "#cd421 = :cd421",
    ProjectionExpression: "#cd421,#cd422,#category",
    ExpressionAttributeValues: {
      ":cd421": "cat#itemweight",
    },
    ExpressionAttributeNames: {
      "#cd421": "PK",
      "#cd422": "SK",
      "#category": "Category",
    },
  };
  try {
    console.log("get item weight ", params);
    let dbresp = await dbcall("query", params);
    if (dbresp.Items.length == 0) {
      return false;
    }
    console.log(dbresp.Items);
    req.categoryDetails.forEach((item) => {
      let categoryItem = dbresp.Items.filter(
        (el) => el.Category == item.category
      );
      totalWeight = totalWeight + categoryItem[0].SK * item.count;
    });
  } catch (ex) {
    console.error("Failure in calculating the total weight ", ex);
    return false;
  }
  totalWeight = totalWeight / 1000;
  console.log("get total weight in kgs", totalWeight);
  totalWeight = Math.round(totalWeight * 2) / 2;
  console.log("get total weight ", totalWeight);
  let taxParams = {
    TableName: process.env.DYNAMODB_TABLE,
    ScanIndexForward: false,
    ConsistentRead: true,
    KeyConditionExpression: "#cd421 = :cd421 and #cd422 = :cd422",
    ProjectionExpression: "#cd421,#cd422,#fueltax,#gst",
    ExpressionAttributeValues: {
      ":cd421": "tax#item",
      ":cd422": 0,
    },
    ExpressionAttributeNames: {
      "#cd421": "PK",
      "#cd422": "SK",
      "#fueltax": "Fueltax",
      "#gst": "GST",
    },
  };
  try {
    console.log("get tax Params ", taxParams);
    let dbresp = await dbcall("query", taxParams);
    console.log("res tax Params ", dbresp);
    if (dbresp.Items.length == 0) {
      return false;
    }

    fueltax = dbresp.Items[0].Fueltax;
    gst = dbresp.Items[0].GST;
    console.log("Tax values ", fueltax);
  } catch (ex) {
    console.error("Failure in calculating the total weight ", ex);
    return false;
  }
  let shippingParams = {
    TableName: process.env.DYNAMODB_TABLE,
    ScanIndexForward: false,
    ConsistentRead: true,
    KeyConditionExpression: "#cd421 = :cd421 and #cd422 = :cd422",
    ProjectionExpression: "#cd421,#cd422,#rate",
    ExpressionAttributeValues: {
      ":cd421": "c#" + req.country,
      ":cd422": totalWeight,
    },
    ExpressionAttributeNames: {
      "#cd421": "PK",
      "#cd422": "SK",
      "#rate": "Rate",
    },
  };
  try {
    console.log("get shipping Params ", shippingParams);
    let dbresp = await dbcall("query", shippingParams);
    console.log("res shipping Params ", dbresp);
    if (dbresp.Items.length == 0) {
      return false;
    }

    let shippingCost =
      dbresp.Items[0].Rate + (dbresp.Items[0].Rate * (fueltax + gst)) / 100;
    return Math.round(shippingCost);
  } catch (ex) {
    console.error("Failure in calculating the total weight ", ex);
    return false;
  }
}
