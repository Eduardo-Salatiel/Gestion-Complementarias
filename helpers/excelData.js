const xlsx = require('xlsx');

exports.excelToJson = (path) => {
    const excel = xlsx.readFile(path);

    let nombreHoja = excel.SheetNames;

    let datos = xlsx.utils.sheet_to_json(excel.Sheets[nombreHoja[0]]);

    return datos
}