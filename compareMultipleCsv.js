const fs = require("fs");
const csv = require("csv-parser");
const { parse } = require("json2csv");

// 파일 경로 배열 (필요한 모든 파일 경로를 여기에 추가)
const filePaths = [
  "nasdaq-input.csv",
  "dow-jones-input.csv",
  "snp-input.csv",
  "kospi-output.csv",
];
const columnName = "Date"; // 'Date' 컬럼을 기준으로 비교

let fileDataArray = [];

// 각 파일에서 데이터를 읽어들임
function readCsvFiles() {
  let fileReadPromises = filePaths.map((filePath) => {
    return new Promise((resolve, reject) => {
      let fileData = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          fileData.push(row);
        })
        .on("end", () => {
          resolve(fileData);
        })
        .on("error", (err) => {
          reject(err);
        });
    });
  });

  return Promise.all(fileReadPromises);
}

// 공통 날짜 필터링
function filterCommonDates(fileDataArray) {
  // 첫 번째 파일의 날짜를 초기 공통 날짜 집합으로 설정
  let commonDates = new Set(fileDataArray[0].map((row) => row[columnName]));

  // 나머지 파일들과 비교하여 공통 날짜를 갱신
  for (let i = 1; i < fileDataArray.length; i++) {
    const currentFileDates = new Set(
      fileDataArray[i].map((row) => row[columnName])
    );
    commonDates = new Set(
      [...commonDates].filter((date) => currentFileDates.has(date))
    );
  }

  // 각 파일 데이터에서 공통 날짜만 남기도록 필터링
  return fileDataArray.map((fileData) => {
    return fileData.filter((row) => commonDates.has(row[columnName]));
  });
}

// 필터링된 데이터를 다시 CSV 파일로 저장
function saveFilteredData(filteredDataArray) {
  filteredDataArray.forEach((filteredData, index) => {
    const filteredCsv = parse(filteredData);
    const outputFilePath = `filtered_file${index + 1}.csv`;
    fs.writeFileSync(outputFilePath, filteredCsv);
    console.log(`${outputFilePath} 파일이 생성되었습니다.`);
  });
}

// 전체 작업 실행
readCsvFiles()
  .then((fileDataArray) => {
    const filteredDataArray = filterCommonDates(fileDataArray);
    saveFilteredData(filteredDataArray);
  })
  .catch((error) => {
    console.error("오류 발생:", error);
  });
