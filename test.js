var tf = require("@tensorflow/tfjs");
require("@tensorflow/tfjs-node");

predictData = [[-0.0065, -0.0081, 0.0023]];
inputData = tf.tensor(predictData);

tf.loadLayersModel("file://./stock-predict/model.json").then(async function (
  model
) {
  const prediction = model.predict(inputData);
  const predictionArray = await prediction.array(); // 예측 값을 배열로 변환
  console.log(predictionArray); // 예측 결과 출력
});
