import csv from "csvtojson";

async function CsvToJson(csvFilePath) {
  try {
    console.log('hi its here')
    const jsonArray = await csv().fromFile(csvFilePath);
    return jsonArray
  } catch (error) {
    console.error("Error converting CSV to JSON:", error);
  }
}

export default CsvToJson;
