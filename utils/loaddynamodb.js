const uuid = require("uuid");
const timestamp = new Date().toLocaleDateString();
const AWS = require('aws-sdk');
const fs = require('fs');
var credentials = new AWS.SharedIniFileCredentials({
  profile: 'ekatva'
});
AWS.config.credentials = credentials;
let options = {
  region: "ap-south-1",
  endpoint: "https://dynamodb.ap-south-1.amazonaws.com"
};
let excludeitems = require('/Users/anjalir/Downloads/ekatva/ekatva-api/zip-api/pincode_new.json');


var ddb = new AWS.DynamoDB(options, {
  apiVersion: '2012-08-10'
});
console.log(excludeitems.length)
//1,47,702
for (i = 140000; i < 147701; i++) {
  if (excludeitems[i] || typeof excludeitems[i] != 'undefined' || excludeitems[i] != null ) {

    if (typeof excludeitems[i] != 'undefined') {
      var params = {
        RequestItems: {
          "zip-prod": [{
            PutRequest: {
              Item: {
                "id": {
                  "S": uuid.v1()
                },
                "Pincode": {
                  "S": excludeitems[i].Pincode
                },
                "Postoffice": {
                  "S": excludeitems[i].Postoffice
                },
                "District": {
                  "S": excludeitems[i].District
                },
                "StateName": {
                  "S": excludeitems[i].StateName
                },
                "Serviceable": {
                  "BOOL": excludeitems[i].Serviceable
                },
                "Servicearea": {
                  "S": excludeitems[i].Servicearea
                },
                "Servicecode": {
                  "S": excludeitems[i].Servicecode
                },
                "Codeligible": {
                  "BOOL": excludeitems[i].Codeligible
                },
                "Shippingrate": {
                  "S": excludeitems[i].Shippingrate
                },
                "createdAt": {
                  "S": timestamp
                },
              }
            }
          }]
        }
      };
      ddb.batchWriteItem(params, function (err, data) {
        if (err) {
          fs.appendFileSync(
            '/Users/anjalir/Downloads/ekatva/ekatva-api/zip-api/zip.log',
            JSON.stringify(excludeitems[i]) + ',' + '\n'
          );
          //console.log("Error", err);
          console.log("error item ", excludeitems[i].Pincode)
        } else {
          console.log("Success", excludeitems[i].Pincode);
          // if (i == 4999)
          // {
          //   console.log(excludeitems[i])
          // }
        }
      });
    }

  }

}
