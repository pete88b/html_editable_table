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

function displayOutputData(data) {
    let innerHTML = '<thead><tr>';
    for (const col in data[0]) { // use the 1st row to get columns names
        innerHTML += `<th>${col}</th>`;
    }
    innerHTML += '</tr></thead>';
    innerHTML += `<tbody>`;
    const rowCount = data.length;
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        innerHTML += `<tr>`;
        for (const col in data[0]) {
            innerHTML += `<td>${data[rowIndex][col]}</td>`;
        }
        innerHTML += `</tr>`;
    }
    innerHTML += `</tbody>`;
    document.getElementById('output_data').innerHTML = innerHTML;
}

function run() {
	document.getElementById("loading-overlay").style.display = 'block';
    fetch('/process-data/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'test' // TODO: this is not a good way to pass an api key
        },
        body: JSON.stringify(extractTableData('table'))
    })
    .then(response => response.json())
    .then(data => {
        displayOutputData(data);
        document.getElementById('loading-overlay').style.display = 'none';
    });
}
document.getElementById('run').onclick = run;