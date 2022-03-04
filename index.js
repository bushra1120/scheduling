const storage = require("azure-storage");
const azure = require("azure-storage");
const helper = require("./helper.js");
var moment = require('moment');
const cors = require('cors');
// const corsOptions ={
//     origin:'http://localhost:3000', 
//     credentials:true,            //access-control-allow-credentials:true
//     optionSuccessStatus:200
// }
// app.use(cors(corsOptions));



const connectionString = "DefaultEndpointsProtocol=https;AccountName=daily-working-report-rep;AccountKey=vcfAllGjESNWioQapuc0OcYdULMyJcoMFOw8K1wgtTE6v14AGPihxYzsjLHWCpwEUTy6jgKmyNyLVu7RwKjttQ==;TableEndpoint=https://daily-working-report-rep.table.cosmos.azure.com:443/";


const storageClient = storage.createTableService(connectionString);

var entities = [];


const path = require('path');
const express = require("express");


const bodyParser = require("body-parser");
const PORT = process.env.PORT || 3001;
const app = express();


app.use(bodyParser.urlencoded({
    extended:false
}));
app.use(bodyParser.json());
app.use(cors());
// Handle GET requests to / route
app.get("/", function(req, res){
  res.json({ message: "Hello from server!" });
});

// Handle GET requests to / route
app.get("/api", function(req, res){
  res.json({ message: "Hello from server!" });
});

// Handle GET requests to /api route
app.get("/api/getAllEmployees", function(req, res){
  var query = new azure.TableQuery().select([
    "RowKey",
    "employeeName",
    "employeeID",
    "role",
    "managerID",
    "employeePassword",
    "EmploymentStatus",
    "EntitlementForScheduledLeave",
    "EntitlementForUnScheduledLeave",
    "CurrentBalanceForScheduledLeave",
    "CurrentBalanceForUnScheduledLeave",
  ]);
  var data;
  storageClient.queryEntities(
    "EmplyeeListCln",
    query,
    null,
    function (error, result, response) {
      if (!error) {
        data = result.entries;
        res.json(data);
      }
    }
  );
});

// Handle POST requests to /api/schedule/:user_id route
app.post("/api/schedule/delete", function(req, res) {
  var newtask = {
    PartitionKey: { _: "10075" },
    RowKey: { _: "10075" },
  };

  storageClient.deleteEntity(
    "EmployeeRoasterCln", newtask,  function (error, result, response) {
      if (!error) {
        res.json("Succcessfully Deleted");
      } else {
        res.json("Schedule not created");
      }
    }
  );
});

// Handle POST requests to /api/schedule/:user_id route
app.post("/api/schedule/add", function(req, res) {
  console.log(req.body);
  var employees = req.body.allEmployees;
  var rand;

  /** Difference of days for loop */
  var date1 = new Date(req.body.startdate);
  var date2 = new Date(req.body.enddate);
  var dates = helper.getDates(date1,date2) 
  //console.log(dates);

  /** Time Calculation  */

   // Start Time PST
  var StartDateTimePST = new Date(req.body.startdate+" "+req.body.starttime+":00").toString();
  const startpst = new Date(StartDateTimePST);
  var StarttimePST = moment(startpst, "h:mm:ss A").format("HH:mm");
  //console.log(StarttimePST);

  // End Time PST
  var EndDateTimePST = new Date(req.body.startdate+" "+req.body.endtime+":00").toString();
  const endpst = new Date(EndDateTimePST);
  var EndtimePST = moment(endpst, "h:mm:ss A").format("HH:mm");
  //console.log(EndtimePST);
  
  // StartTimeEST
  var StartDateTimeEST = helper.calcTime('America', '-15.0', StartDateTimePST);
  const startest = new Date(StartDateTimeEST);
  var StarttimeEST = moment(startest, "h:mm:ss A").format("HH:mm");
  //console.log(StarttimeEST);

  // EndTimeEST
  var EndDateTimeEST = helper.calcTime('America', '-15.0', EndDateTimePST);
  const endest = new Date(EndDateTimeEST);
  var EndtimeEST = moment(endest, "h:mm:ss A").format("HH:mm");
 
  var acDate1;
  var message = {"message": "success"};
  
  /** calculate the difference betwwen Times */
  var totalHours = helper.getTotalHours(startpst,endpst);
  employees.map((employeeData, index) => {
    dates.map((dateTask, index) => {
      acDate = new Date(dateTask);
      acDate1 = helper.dbDate(acDate);
      
      /** Select employee with date */
      var query2 = new azure.TableQuery().where(
        "EmployeeID eq ?",
        employeeData.employeeID
      ).and("Date eq ?", acDate1);
      var newdate = acDate1;
      var acday1 = acDate.getDay();
      storageClient.queryEntities(
        "EmployeeRoasterCln",
        query2,
        null,
        function (error, result, response) {
          if (!error) {
            
            if(acday1 == '0' || acday1 == '6'){
              if(acday1 == '6' && req.body.isSaturdayOn === true){
                newTask = {
                  PartitionKey: employeeData.employeeID,
                  RowKey: employeeData.employeeID + helper.getRandomInt(10000),
                  EmployeeID: employeeData.employeeID,
                  EmployeeName: employeeData.employeeName,
                  Team: req.body.team,
                  Date: newdate,
                  StartTimePST: StarttimePST,
                  StartTimeEST: StarttimeEST,
                  EndTimePST: EndtimePST,
                  EndTimeEST: EndtimeEST,
                  TotalHours: totalHours,
                }
              } else {
                newTask = {
                  PartitionKey: employeeData.employeeID,
                  RowKey: employeeData.employeeID + helper.getRandomInt(10000),
                  EmployeeID: employeeData.employeeID,
                  EmployeeName: employeeData.employeeName,
                  Team: req.body.team,
                  Date: newdate,
                  StartTimePST: 'OFF',
                  StartTimeEST: 'OFF',
                  EndTimePST: 'OFF',
                  EndTimeEST: 'OFF',
                  TotalHours: 'OFF',
                }
              }
            } else {
              newTask = {
                PartitionKey: employeeData.employeeID,
                RowKey: employeeData.employeeID + helper.getRandomInt(10000),
                EmployeeID: employeeData.employeeID,
                EmployeeName: employeeData.employeeName,
                Team: req.body.team,
                Date: newdate,
                StartTimePST: StarttimePST,
                StartTimeEST: StarttimeEST,
                EndTimePST: EndtimePST,
                EndTimeEST: EndtimeEST,
                TotalHours: totalHours,
              }
            } 
            if(result.entries.length > 0){
             // let text = "Are you confirm you want to overwrite employee data?";
             console.log(result.entries);
              var existingEmployees = result.entries;
              existingEmployees.map((task, index) => {
                let newTask1 = {
                  PartitionKey: { _: task.EmployeeID._ },
                  RowKey: { _: task.RowKey._ },
                };
                storageClient.deleteEntity(
                  "EmployeeRoasterCln",
                  newTask1,
                  function (error, result, response) {
                    if (!error) {
                      var message = {"message" : "Deleted Successfully"}
                    } else {
                      var message = {"message" : "No Record Found"}
                      //console.log(error);
                      //res.json("Schedule not updated");
                    }
                  }
                );
                console.log(newTask);
                storageClient.insertEntity(
                  "EmployeeRoasterCln",
                  newTask,
                  function (error, result, response) {
                    if (!error) {
                      var message = {"message" : "Records has been Updated Successfully"}
                    } else {
                      var message = {"message" : "No Record Found"}
                      //console.log(error);
                      //res.json("Schedule not updated");
                    }
                  }
                );
              });
              //console.log(result.entries.PartitionKey);
              //console.log(result.entries.RowKey);
              storageClient.mergeEntity(
                "EmployeeRoasterCln", newTask,  function (error, result, response) {
                  //console.log(response);
                  if (!error) {
                    var message = {"message" : "Records has been inserted Successfully"}
                  } else {
                  // res.json("Schedule not created");
                  }
                }
              );
              
                  
              
              
                 
            } else {
              
              console.log(newTask);
              storageClient.insertEntity(
                "EmployeeRoasterCln", newTask,  function (error, result, response) {
                  //console.log(response);
                  if (!error) {
                    var message = {"message" : "Records has been inserted Successfully"}
                  } else {
                  // res.json("Schedule not created");
                  }
                }
              );
              

            }

          } else {
            var message = {"message" : "No Record Found"}

          }
        }
      );
      
    });
    
  });
  res.json(message);
});

app.post("/api/schedule/check", function(req, res) {
  
 
  var StartDateTimePST = new Date(req.body.startdate+" "+req.body.starttime+":00").toString();
  const startpst = new Date(StartDateTimePST);
  var StarttimePST = moment(startpst, "h:mm:ss A").format("HH:mm");
  console.log(StarttimePST);

  var EndDateTimePST = new Date(req.body.startdate+" "+req.body.endtime+":00").toString();
  const endpst = new Date(EndDateTimePST);
  var EndtimePST = moment(endpst, "h:mm:ss A").format("HH:mm");
  console.log(EndtimePST);
  

  var StartDateTimeEST = helper.calcTime('America', '-14.0', StartDateTimePST);
  const startest = new Date(StartDateTimeEST);
  var StarttimeEST = moment(startest, "h:mm:ss A").format("HH:mm");
  console.log(StarttimeEST);

  var EndDateTimeEST = helper.calcTime('America', '-14.0', EndDateTimePST);
  const endest = new Date(EndDateTimeEST);
  var EndtimeEST = moment(endest, "h:mm:ss A").format("HH:mm");

  console.log(EndtimeEST);
  console.log("--------------");
  console.log("Start Time:"+startpst);
  console.log("End Time:"+endpst);
  console.log(startpst);
  var totalHours = helper.getTotalHours(startpst,endpst);
  console.log(totalHours);
  



  
  
});





// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});




app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});