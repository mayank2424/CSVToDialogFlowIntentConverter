const fs = require('fs');
const helper = require('./helpers/filterHelper');
const csvtojson = require('csvtojson');


//Convert csv to json
async function CsvToJson(filepath) {
    csvtojson().fromFile(filepath).then((response) => {
        filterData(response);
    })
    .catch(err => {
        console.log("Error: Invalid file or please check the file path :)")
    })
}

// Read JSON File
async function readFile(file) {
    await fs.readFile(file, filterData)
}


//Filter data from raw data
function filterData(data) {

    //Filter data
    const filteredData = helper.filterData(data);

    //Create agent zip 
    helper.createIntentFolder(filteredData).then(res => {
        console.log(res)
    }).catch(err => {
        console.log("Error",err)
    })
    
}


const path = process.env.path;

if(!path) {
    console.log({Error:"Invalid file path"})
    return
} else {
    CsvToJson(path)
}
