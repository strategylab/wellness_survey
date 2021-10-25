

let surveyData;
let qualtricsHeader = 'Qualtrics Question ID';

let quantiles = {'Experience':70,'Relevance':65}

let dataWedgeObj, filterPanelObj;
// (1) Load data with promises

function updateDisplay(){
    // console.log('updated data is ', surveyData)
}

// d3.json("data/survey.json").then(d=>console.log(d))
let promises = [
    //survey questions sheet
    d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vRm3RRGXN2mFoFXIfZY5CsLgtmC8vawChFS7cWJEbIROojynou107krBVv_6CmtRqXaP53qpzLUbczh/pub?gid=0&single=true&output=csv"),
   //survey responses sheet
    d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vTP_RG-pJHJWjk3QaT16f4Io7IlHUbsYF3eB5h8NorScEEN5xKF_AWv9RCQfCO_S-NrlRlwf3qe4XJa/pub?gid=1274511277&single=true&output=csv"),
    //survey userQuestions sheet
    d3.csv("https://docs.google.com/spreadsheets/d/e/2PACX-1vSugTmsTRgVq3LDdIv1-suHzbU_0UPk--9c2UPQZoo2TQuXETAjO8C6XGmVesiCYSrC8wBNySXTGWl0/pub?gid=0&single=true&output=csv"),
    // d3.csv("data/surveyUserQuestions.csv"),
    d3.csv("data/Aspect+Health+-+Care+Team+Member+Experience_DRAFT_September+23,+2021_09.07.csv")];

Promise.all(promises)
    .then( function(data){createVis(data)} )
    .catch( function (err){console.log(err)} );

function quantileChanged(set,quantile){
    quantiles[set]=quantile;
    dataWedgeObj.recomputeQuantiles()
}

function dataFiltered(){
    dataWedgeObj.recomputeQuantiles()
}

function createVis(data){

   // //questions of interest
    // let questions = ['Q34_1', 'Q34_2', 'Q34_3', 'Q34_4', 'Q34_5', 'Q34_6', 'Q34_7', 'Q35_1', 'Q35_2', 'Q35_3', 'Q35_4', 'Q35_5', 'Q35_6', 'Q35_7'];

    // let dataDict = {};
    
    // questions.map(a=> dataDict[a] = {data:[]});

    // let newData = aspectData.map(dd=>Object.fromEntries(Object.entries(dd).filter(([key]) => questions.includes(key))))
    // newData.map(d=>{
    //     Object.keys(d).map(k=>{
    //         dataDict[k].data.push(+d[k])
    //     })
    // })

    // Object.keys(dataDict).map(k=>{
    //     //sort data
    //     dataDict[k].data.sort();
    //     // console.log(k, dataDict[k].data);
    //     dataDict[k].min = d3.min(dataDict[k].data)
    //     dataDict[k].max = d3.max(dataDict[k].data)
    //     dataDict[k].upper = d3.quantile(dataDict[k].data, 0.85); 
    //     dataDict[k].lower = d3.quantile(dataDict[k].data, 0.15); 

    // })
    
    // console.log(data[0])

    let qualtricsHeader = 'Qualtrics Question ID'

   
    let surveyQuestions = data[0];
    let surveyResponses = data[1];
    let surveyUserQuestions = data[2];

    surveyUserQuestions.map(q=>{
        q['Options'] = q['Options'].split('\n')
    })

    let lookUpKey ={};
    surveyUserQuestions.map(q=>{
        lookUpKey[q[qualtricsHeader]] = q;
    })


    let sampleResponse = surveyResponses[2]
    let keys = Object.keys(sampleResponse).filter(k=>k[0] == 'Q');

     //create fake data following the structure of the surveyResponses; 
     let fakeData = Array.from({length: 30},function(){
        
         let newResponse = JSON.parse(JSON.stringify(sampleResponse));

         keys.map(k=>{
             //is this a user key or a rating key? 
             if (lookUpKey[k]){
                 let options = lookUpKey[k].Options;
                 if (options.length == 1){
                    newResponse[k]= 'random role'
                 } else {
                     let randomOption = d3.randomInt(0,options.length)();
                     newResponse[k] = options[randomOption]
                 }

             }else if (k[1]!== '9') {
                 let question = surveyQuestions.filter(q=>q[qualtricsHeader] == k);
                 if (question.length>0){
                     
                    if (question[0].Set == 'Experience'){
                        // console.log('here')
                        newResponse[k] = d3.randomInt(2,5)()//Math.round(d3.randomNormal(4, .5)());

                    }else{
                        newResponse[k] = d3.randomInt(1,4)() //Math.round(d3.randomNormal(2, .5)());

                 }
                }
                // newResponse[k] = Math.round(d3.randomInt(1,5)());
             }
            
         })
        return newResponse
     });

     fakeData.map(d=>d.selected = true)
     surveyData = fakeData;

     dataWedgeObj = new dataWedge('dataWedge',surveyQuestions)
    filterPanelObj = new filterPanel('filterPanel',surveyUserQuestions)
}