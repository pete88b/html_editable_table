function resetEventListeners(table) { // rename to resetNewColumnAndRowListeners
    Array.from(table.getElementsByTagName('th')).forEach((th, i, array) => {
        th.removeEventListener('input', table.makeNewColumn);
        if (i + 1 === array.length) {
            th.addEventListener('input', table.makeNewColumn);
        }
    });
    Array.from(table.getElementsByTagName('tr')).forEach((tr, trIdx, trArray) => {
        Array.from(tr.getElementsByTagName('td')).forEach((td, tdIdx, tdArray) => {
            td.removeEventListener('input', table.makeNewColumn);
            td.removeEventListener('input', table.makeNewRow);
            td.removeEventListener('input', table.makeNewColumnAndRow);
            const lastColumn = (tdIdx + 1 === tdArray.length);
            const lastRow = (trIdx + 1 === trArray.length);
            if (lastColumn & lastRow) {
                td.addEventListener('input', table.makeNewColumnAndRow);
            } else if (lastColumn) {
                td.addEventListener('input', table.makeNewColumn);
            } else if (lastRow) {
                td.addEventListener('input', table.makeNewRow);
            }
        });
    });
}

function columnIndexOfCell(cell) { // th or td
    const children = cell.parentElement.children;
    for (let i = 0; i < children.length; i++) {
        if (children[i] === cell) {
            return i;
        }
    }
    throw `failed to find cell in parents children ${cell}`
}

function toggleColumnHidden(table, cell) {
    const columnIndex = columnIndexOfCell(cell);
    const th = Array.from(table.getElementsByTagName('th'))[columnIndex];
    const hidden = th.classList.contains('hidden'); // TODO: use hidden state of column when adding new rows
    Array.from(table.getElementsByTagName('tr')).forEach(tr => {
        const child = Array.from(tr.children)[columnIndex];
        if (hidden) {
            child.classList.remove('hidden');
        } else {
            child.classList.add('hidden');
        }
    });
}

function newTh(table, columnName) {
    const th = document.createElement('th');
    th.contentEditable = 'true';
    th.textContent = columnName;
    th.onkeydown = (event) => {
        if (event.altKey && (event.key == 'ArrowUp' || event.key == 'ArrowDown')) {
            toggleColumnHidden(table, th);
            event.preventDefault();
        }
    };
    return th;
}

function newTd(table, columnName, value) {
    const td = document.createElement('td');
    td.contentEditable = "true";
    td.textContent = value;
    td.onkeydown = (event) => {
        if (event.altKey && (event.key == 'ArrowLeft' || event.key == 'ArrowRight')) {
            td.parentElement.classList.toggle('hidden');
            event.preventDefault();
        }
        if (event.altKey && (event.key == 'ArrowUp' || event.key == 'ArrowDown')) {
            toggleColumnHidden(table, td);
            event.preventDefault();
        }
    };
    return td;
}

function makeNewColumn(table) {
    const ths = Array.from(table.getElementsByTagName('th'));
    const th = ths[ths.length - 1];
    if (th.textContent == '') {
        const columnCount = table.getElementsByTagName('th').length;
        th.textContent = `Column ${columnCount}`;
    }
    Array.from(table.getElementsByTagName('tr')).forEach((tr, i) => {
        tr.append((i == 0) ? newTh(table, '') : newTd(table, ''));
    });
    resetEventListeners(table);
}

function makeNewRow(table) {
    const tr = document.createElement('tr');
    const tbody = Array.from(table.getElementsByTagName('tbody'))[0];
    tbody.append(tr);
    Array.from(table.getElementsByTagName('th')).forEach((th, i) => {
        const td = newTd(table, th.textContent, '');
        tr.append(td);
    });
    resetEventListeners(table);
}

function makeNewColumnAndRow(table) {
    makeNewColumn(table);
    makeNewRow(table);
}

function createTable(tableElementId, tableData) {
    const table = document.getElementById(tableElementId);
    table.makeNewColumn = () => makeNewColumn(table);
    table.makeNewRow = () => makeNewRow(table);
    table.makeNewColumnAndRow = () => makeNewColumnAndRow(table);
    // remove existing table content 
    let child = table.lastElementChild;
    while (child) {
        table.removeChild(child);
        child = table.lastElementChild;
    }
    // populate table content
    const thead = document.createElement('thead');
    table.append(thead);
    let tr = document.createElement('tr');
    thead.append(tr);
    let row = tableData[0];
    const columnNames = Object.keys(row);
    columnNames.push('');
    columnNames.forEach(columnName => {
        tr.append(newTh(table, columnName));
    });
    const tbody = document.createElement('tbody');
    table.append(tbody);
    tableData.forEach(row => {
        const tr = document.createElement('tr');
        tbody.append(tr);
        columnNames.forEach(columnName => {
            tr.append(newTd(table, columnName, row[columnName]));
        });
    });
    makeNewRow(table);
}

const demoData = [
    {col1:'a', col2:'bx'},
    {col1:'a2', col2:'b2'},
    {col1:'A3', col2:'b3.3'}
];
createTable('table', demoData);
const jsonElement = document.getElementById('json');
jsonElement.value = JSON.stringify(demoData).replaceAll('},{', '},\n{');
const tableToJson = document.getElementById('tableToJson');
tableToJson.onclick = function(event) {
    let data = extractTableData('table');
    console.log(data);
    jsonElement.value = JSON.stringify(data).replaceAll('},{', '},\n{');
};
const jsonToTable = document.getElementById('jsonToTable');
jsonToTable.onclick = function(event) {
    createTable('table', JSON.parse(jsonElement.value));
};

function extractTableData(tableElementId) {
    const data = [];
    const columnPositionToName = [];
    const columnPositionToHidden = [];
    const table = document.getElementById(tableElementId);
    Array.from(table.getElementsByTagName('th')).forEach((th, i) => {
        columnPositionToName.push(th.textContent);
        columnPositionToHidden.push(th.classList.contains('hidden'));
    });
    const tbody = Array.from(table.getElementsByTagName('tbody'))[0];
    Array.from(tbody.getElementsByTagName('tr')).forEach((tr, trIdx, trArray) => {
        if (trIdx + 1 === trArray.length) {
            return; // ignore the last row
        }
        if (tr.classList.contains('hidden')) {
            return; // ignore hidden rows
        }
        const row = {};
        data.push(row);
        Array.from(tr.getElementsByTagName('td')).forEach((td, tdIdx, tdArray) => {
            if (tdIdx + 1 === tdArray.length) {
                return; // ignore the last column
            }
            if (columnPositionToHidden[tdIdx]) {
                return; // ignore hidden columns
            }
            row[columnPositionToName[tdIdx]] = td.textContent;
        });
    });
    return data;
}

function displayOutputData(data) {
    let innerHTML = '<thead><tr>';
    let columns = [];
    for (const col in data) {
        columns.push(col);
        innerHTML += `
            <th contenteditable="true">${col}</th>`;
    }
    innerHTML += '</tr></thead>';
    innerHTML += `<tbody>`;
    const rowCount = data[columns[0]].length;
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        innerHTML += `<tr>`;
        for (const col in data) {
            innerHTML += `
                <td contenteditable="true">${data[col][rowIndex]}</td>`;
        }
        innerHTML += `</tr>`;
    }
    innerHTML += `</tbody>`;
    document.getElementById('output_data').innerHTML = innerHTML;
}

function run() {
	document.getElementById("loading-overlay").style.display = 'block';
	xhr = new XMLHttpRequest();
    xhr.open('POST', '/run-data-process-step/', true);
    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            // TODO: check HTTP status
            response = JSON.parse(xhr.responseText);
            console.log(response); // xxx
            displayOutputData(response);
			document.getElementById("loading-overlay").style.display = 'none';
        }
    };
	xhr.setRequestHeader("Content-Type", "application/json");
	xhr.setRequestHeader('x-api-key', 'test');
    //xxx
    let table = document.getElementById('rule_args_data');
    let tbody = table.getElementsByTagName('tbody')[0];
    let ruleArgs = [];
    Array.from(tbody.getElementsByTagName('tr')).forEach((tr, rowIndex) => {
        let tds = Array.from(tr.getElementsByTagName('td'));
        ruleArgs.push([tds[0].textContent, tds[1].textContent]);
    });
    xhr.send(JSON.stringify({
        rule_name: 'CleanStrDataProcessStep', // TODO: xxx
        rule_args: [ruleArgs],
		input_data: extractTableData('input_data')
    }));
}

function addRow(tableElementId) {
    let table = document.getElementById(tableElementId);
    let tbody = table.getElementsByTagName('tbody')[0];
    let tr = document.createElement('tr');
    let column_count = Array.from(table.getElementsByTagName('th')).length;
    for (let i = 0; i < column_count - 1; i++) {
        td = document.createElement('td');
        td.contentEditable = "true"; // TODO: all except the last one
        tr.append(td);
    }
    td = document.createElement('td');

    let a = document.createElement('a');
    a.setAttribute('href', '#');
    a.appendChild(document.createTextNode('Delete this row'));
    td.appendChild(a);
    // td.textContent = 'Delete this row'
    tr.append(td);
    tbody.append(tr);
    dTable(tableElementId);
}


function dTable(tableElementId) {
    let table = document.getElementById(tableElementId);

    // Array.from(table.getElementsByTagName('tr')).forEach((tr, i) => {
    //     const cell = document.createElement(i ? "td" : "th");
    //     cell.contentEditable = "true";
    //     tr.appendChild(cell);
    // });
    function th_input(event) {
        let data = {};
        let columnPositionToName = [];
        let table = document.getElementById(tableElementId);
        let tbody = table.getElementsByTagName('tbody')[0];
        let innerHTML = `CleanStr([`;
        Array.from(tbody.getElementsByTagName('tr')).forEach((tr, rowIndex) => {
            if (rowIndex > 0) {
                innerHTML += ', ';
            }
            tds = Array.from(tr.getElementsByTagName('td'));
            innerHTML += `['${tds[0].textContent}', '${tds[1].textContent}']`;
        });
        innerHTML += `])`;
        document.getElementById('generated_rule_args').innerHTML = innerHTML;

        innerHTML = `Running this step will;`;
        Array.from(tbody.getElementsByTagName('tr')).forEach((tr, rowIndex) => {
            tds = Array.from(tr.getElementsByTagName('td'));
            innerHTML += `\n- replace "${tds[0].textContent}" with "${tds[1].textContent}" `;                
        });
        innerHTML += `\n- then remove leading/trailing whitespace from all values.`;
        document.getElementById('generated_rule_desc').innerHTML = innerHTML;
    }
    Array.from(table.getElementsByTagName('td')).forEach((th, i) => {
        th.addEventListener("input", th_input, false);
    });

}
