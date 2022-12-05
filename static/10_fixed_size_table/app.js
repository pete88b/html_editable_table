function extractTableData(tableElementId) {
    const data = [];
    const columnPositionToName = [];
    const table = document.getElementById(tableElementId);
    Array.from(table.getElementsByTagName('th')).forEach((th, i) => {
        columnPositionToName.push(th.textContent);
    });
    const tbody = Array.from(table.getElementsByTagName('tbody'))[0];
    Array.from(tbody.getElementsByTagName('tr')).forEach((tr, trIdx, trArray) => {
        const row = {};
        data.push(row);
        Array.from(tr.getElementsByTagName('td')).forEach((td, tdIdx, tdArray) => {
            row[columnPositionToName[tdIdx]] = td.textContent;
        });
    });
    return data;
}

const jsonElement = document.getElementById('json');
const tableToJson = document.getElementById('tableToJson');
tableToJson.onclick = function(event) {
    var data = extractTableData('table');
    jsonElement.value = JSON.stringify(data).replaceAll('},{', '},\n{');
};
