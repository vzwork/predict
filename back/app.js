// imports
const readline = require("readline");
const {
  initializeApp,
  applicationDefault,
  cert,
} = require("firebase-admin/app");
const {
  getFirestore,
  collection,
  Timestamp,
  FieldValue,
  Filter,
} = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
// imports

// launch python process
// const pathToPythonScript = path.join(process.cwd(), 'python', 'process.py')

// // Create a child process to run the Python script
// const pythonProcess = spawn('python3', [pathToPythonScript]);

// // Handle data received from the Python process
// pythonProcess.stdout.on('data', (data) => {
//   console.log(`Python script output: ${data}`);
// });

// pythonProcess.stderr.on('data', (data) => {
//   console.error(`Error from Python script: ${data}`);
// });

// // Handle when the Python process exits
// pythonProcess.on('exit', (code) => {
//   console.log(`Python script exited with code ${code}`);
// });

// // Pass input to the Python process
// const userInput = 'Hello, Python!';
// pythonProcess.stdin.write(userInput);
// pythonProcess.stdin.end(); // Close the stdin stream to signal end of input
// launch python process

// database setup
const serviceAccount = require("./service_account.json");
initializeApp({
  credential: cert(serviceAccount),
});
const db = getFirestore();
// database setup

// side job - work on processing images
// db.collection("queue").onSnapshot((snapshot) => {
//   snapshot.docChanges().forEach((change) => {
//     console.log('\n' + change.doc.id)

//     const filePathInput = path.join(process.cwd(), "python", "input.json");
//     const output = path.join(process.cwd(), "python", "output.json");

//     // Write to file
//     fs.writeFile(filePathInput, JSON.stringify(change.doc.data()), (err) => {
//       if (err) {
//         console.log("Error writing to file:", err);
//       } else {
//         console.log("Data has been written to the file successfully.");
//       }
//     });
//   });
// });
// side job - work on processing images

// cli interaction
// cli options:
// - "reset" - delete all data from collections: "queue", "workloads"
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
function processInput(input) {
  // Add your processing logic here
  console.log(`Processing input: ${input}`);
  if (input == "reset") {
    let collectionRef = db.collection("queue");

    // Delete all documents in the collection
    collectionRef
      .listDocuments()
      .then((documents) => {
        const deletePromises = documents.map((document) => document.delete());

        return Promise.all(deletePromises);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    collectionRef = db.collection("workloads");

    // Delete all documents in the collection
    collectionRef
      .listDocuments()
      .then((documents) => {
        const deletePromises = documents.map((document) => document.delete());

        return Promise.all(deletePromises);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}
function handleInput() {
  rl.question('Enter input (type "exit" to close): \n', (input) => {
    if (input.toLowerCase() === "exit") {
      rl.close(); // Close the readline interface to exit the program
      // pythonProcess.kill();
      process.exit(0);
    } else {
      processInput(input);
      handleInput(); // Continue to handle input
    }
  });
}
console.log('Type "exit" to close the program.');
handleInput(); // Start handling input
// cli interaction
