const fs = require('fs');

const zipper = require('zip-local');


//Filter Data Handler
function filterData(rawData) {

    const uniqueIntent = {};

    rawData.forEach((item) => {
        if(uniqueIntent[item.IntentName]) {
            uniqueIntent[item.IntentName].push(item) 
        } else {
            uniqueIntent[item.IntentName] = [];
            uniqueIntent[item.IntentName].push(item)
        }
    })

    return uniqueIntent;
}   


async function createIntentFolder(data) {
    //grab all intents name 
    const intentFileName = Object.keys(data);

    //Step 1: Create new directory with name intents
    let dir = './agent/intents'

    return new Promise ((re, rj) => {
        new Promise((resolve, reject) => {
            if(!fs.existsSync(dir)) {
                fs.mkdir(dir,  { recursive: true },(err) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve({message:"Folder created Successfully", path:dir, status:200})
                    }
                })
            } else {
                reject({message:"Folder already Present", path:dir,status:400})
            }
        })
        .then((res) => {
            //Create new intent files for every intent
            intentFileName.map(item => {
                new Promise((resolve, reject) => {
                    
                    let fileName = `${res.path}/${item}.json`;
                    let d = convertDataToIntentResponse(data[item], item);
                    fs.writeFile(fileName,JSON.stringify(d),(err, data) =>{
                        if(err) {
                            reject(err)
                        } else {
                            resolve(true);
                        }
                    })
                    resolve(true)
                })
                .then(response => {
                    new Promise((resolve, reject) => {
                        if(response) {
                            let fileName  = `${res.path}/${item}_usersays_en.json`;
                            let d = convertDataToIntentUserResponse(data[item], item);
                            fs.writeFile(fileName, JSON.stringify(d), (err, data) => {
                                if(err) {
                                    reject(err);
                                } else {
                                    resolve(true)
                                }
                            })
                        } else {
                            reject({message:"No Training Phrase present", status:400})
                        }
                    })
                })
            })
            
            let packageJsonContent = {"version":"0.0.1"}
            fs.writeFile('./agent/package.json', JSON.stringify(packageJsonContent),(err, data) => {
                if(!err) {
                    //Create zip
                    createZIP().then(result => {
                        re({msg:"Successfully Created Agent ZIP", status:200})
                    }).catch(error => {
                        rj(error)
                    })
                } else {
                    rj(err);
                }
            })
        })
        .catch(err => {
            rj(err);
        })
    }) 
}

async function createZIP() {

    return new Promise((resolve, reject) => {
        zipper.zip('./agent', (err, res) => {
            if(!err) {
                res.compress();
    
                //Buffered zip file
                var buff = res.memory();
    
                res.save("./agent.zip", function(error) {
                    if(!error) {
                        resolve(true);

                        // //Remove directory
                        // fs.rmdirSync('./agent', {recursive:true}, (e, d) => {
                        //     if(!e) {
                        //         resolve(true)
                        //     } else {
                        //         reject(e);
                        //     }
                        // })
                    } else {
                        reject(error)
                    }
                })
            } else {
                reject(err);
            }
        })
    })
}

function convertDataToIntentResponse(data, intentName) {

    let json = {
        "name":intentName,
            "auto":true,
            "responses":[
                {
                    "resetContexts":false,
                    "messages":[{
                        "type":0,
                        "lang":"en",
                        "speech":[]
                    }]
                }
            ]
    }
   
    data.map(el => {
        json.responses[0].messages[0].speech.push(el.Response)
    })

    return json;
}

function convertDataToIntentUserResponse(data, intentName) {
 
    let json = [];

    data.map(el => {
        json.push({
            "data": [{"text": el.Query, "userDefined":false}],
            "isTemplate":false
        })
    })

    return json;
}


module.exports = {
    filterData:filterData,
    createIntentFolder:createIntentFolder
}


