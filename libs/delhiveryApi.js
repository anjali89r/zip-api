import { apicall } from "./apiLib.js";
import { retrieveSecrets } from "./awsLib";

let secretName = process.env.delhivery_secretmanager_name;
let host = process.env.delhiveryhost;

export async function getDelhiveryDetails(trackingNo, providerType) {
  let url =
    host + "/api/v1/packages/json/" + "?waybill=" + trackingNo + "&verbose=1";
  let headers = {};
  let authorization = "Token ";
  let secret;
  providerType = providerType.split(" ").join("");
  const secretJSON = JSON.parse(await retrieveSecrets(secretName));
  if (providerType == "EKATVASURFACE") {
    secret = secretJSON.SURFACE;
  } else if (providerType == "EKATVAEXPRESS") {
    secret = secretJSON.EXPRESS;
  }

  authorization += secret;

  headers = {
    Authorization: authorization,
  };
  try {
    let response = await apicall("get", url, "", headers);

    if (response.ShipmentData) {
      return response.ShipmentData;
    } else {
      console.error(
        "Error: Response from Delhivery api to get Shipment details",
        response
      );
      return "Failed";
    }
  } catch (error) {
    console.error("Error: Exception with the api call ", error);
  }
}

export async function createDelhiveryShipment(shipmentRequest, providerType) {
  let url = host + "/api/cmu/create.json";
  let headers = {};
  var authorization = "Token ";
  let secret;
  providerType = providerType.split(" ").join("");
  const secretJSON = JSON.parse(await retrieveSecrets(secretName));
  if (providerType == "EKATVASURFACE") {
    secret = secretJSON.SURFACE;
  } else if (providerType == "EKATVAEXPRESS") {
    secret = secretJSON.EXPRESS;
  }
  authorization += secret;

  headers = {
    Authorization: authorization,
    "Content-Type": "application/json",
  };
  let body = "format=json&data=" + JSON.stringify(shipmentRequest);
  try {
    let response = await apicall("post", url, body, headers);
    if (!("rmk" in response)) {
      return response;
    } else {
      console.error(
        "Error: Response from Delhivery api to create shipment",
        response
      );
      return "Failed";
    }
  } catch (error) {
    console.error("Error: Exception with the api call ", error);
  }
}

export async function checkPinCodeServiceability(pinCode, country) {
  // https://track.delhivery.com/c/api/pin-codes/json/?filter_codes=799204
  let url = host + "/c/api/pin-codes/json/?filter_codes=" + pinCode;
  let headers = {};
  let authorization = "Token ";
  let secret;
  const secretJSON = JSON.parse(await retrieveSecrets(secretName));
  secret = secretJSON.SURFACE;
  authorization += secret;
  headers = {
    Authorization: authorization,
  };
  try {
    let response = await apicall("get", url, "", headers);
    if (response.delivery_codes.length) {
      let pinDetails = response.delivery_codes.filter(
        (el) => el.postal_code.pin == pinCode
      );
      if (pinDetails[0].postal_code) {
        return pinDetails[0].postal_code;
      } else {
        return "Failed";
      }
    } else {
      console.error(
        "Error: Response from Delhivery api to get Shipment details",
        response
      );
      return "Failed";
    }
  } catch (error) {
    console.error("Error: Exception with the api call ", error);
  }
}
