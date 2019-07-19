const createMetaData = ({ name, version }) => {
  return {
    "metadata":{
       "service":{
          "name": name,
          "version": version,
          "agent":{
             "name": "custom-agent",
             "version": "0.2.0-alpha"
          },
          "language":{
             "name":"javascript"
          }
       }
    }
 };
};

const createTransaction = () => {

};

const NDJSON = function() {};
NDJSON.stringify = function(object) {
   return `${JSON.stringify(object)}\n`;
};

module.exports = {
   NDJSON,
   createMetaData,
};