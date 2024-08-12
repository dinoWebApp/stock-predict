const fs = require("fs");
const csv = require("csv-parser");
const { parse } = require("json2csv");

// 입력 및 출력 파일 경로 설정
const inputFilePath = "stock-output.csv";
const outputFilePath = "stock-parse-output.csv";

// 데이터를 저장할 배열
let data = [];

// CSV 파일 읽기
fs.createReadStream(inputFilePath)
  .pipe(csv())
  .on("data", (row) => {
    // 각 행의 각 컬럼 값을 업데이트
    for (let key in row) {
      let value = parseFloat(row[key].replace(/,/g, "")); // ','가 포함된 숫자 처리
      if (!isNaN(value)) {
        // 값이 음수면 -1, 양수면 1로 설정
        row[key] = value < 0 ? -1 : 1;
      }
    }
    data.push(row);
  })
  .on("end", () => {
    // 업데이트된 데이터를 CSV 형식으로 변환
    const csvData = parse(data);

    // 변환된 데이터를 새 CSV 파일로 저장
    fs.writeFileSync(outputFilePath, csvData);
    console.log(`CSV 파일이 업데이트되어 ${outputFilePath}에 저장되었습니다.`);
  })
  .on("error", (err) => {
    console.error("파일을 읽는 동안 오류가 발생했습니다:", err);
  });
