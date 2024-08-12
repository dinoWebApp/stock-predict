var tf = require("@tensorflow/tfjs");
require("tfjs-node-save");
const fs = require("fs");

const inputCsv = fs.readFileSync("./stock-input.csv", "utf-8");
const inputRows = inputCsv.split("\r\n");
const outputCsv = fs.readFileSync("./stock-parse-output.csv", "utf-8");
const outputRows = outputCsv.split("\r\n");
const input = [];
const output = [];
for (let i in inputRows) {
  const row = inputRows[i];
  const data = row.split(",");
  const parseData = [];
  for (let j in data) {
    parseData.push(parseFloat(data[j]));
  }
  input.push(parseData);
}

for (let i in outputRows) {
  const row = outputRows[i];
  const data = row.split(",");
  const parseData = [];
  for (let j in data) {
    parseData.push(parseFloat(data[j]));
  }
  output.push(parseData);
}

var tfInput = tf.tensor(input);
var tfOutput = tf.tensor(output);

var X = tf.input({ shape: [3] });
var layer1 = tf.layers.dense({ units: 3, activation: "relu" }).apply(X);
var layer2 = tf.layers.dense({ units: 3, activation: "relu" }).apply(layer1);
var Y = tf.layers.dense({ units: 1 }).apply(layer2);

var model = tf.model({ inputs: X, outputs: Y });
var compileParam = {
  optimizer: tf.train.adam(),
  loss: tf.losses.meanSquaredError,
};
model.compile(compileParam);

var fitParam = {
  epochs: 5000,
  callbacks: {
    onEpochEnd: function (epoch, logs) {
      console.log("epoch", epoch, logs, "RMSE=>", Math.sqrt(logs.loss));
    },
  },
};
model.fit(tfInput, tfOutput, fitParam).then(function (result) {
  var learnedOutput = model.predict(tfInput);
  learnedOutput.print();
  model.save("file://./stock-predict");
});
