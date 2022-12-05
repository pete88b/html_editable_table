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

function newTh(table, columnName) {
    const th = document.createElement('th');
    th.contentEditable = 'true';
    th.textContent = columnName;
    return th;
}

function newTd(table, columnName, value) {
    const td = document.createElement('td');
    td.contentEditable = "true";
    td.textContent = value;
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

function initTable(tableElementId) {
    const table = document.getElementById(tableElementId);
    table.makeNewColumn = () => makeNewColumn(table);
    table.makeNewRow = () => makeNewRow(table);
    table.makeNewColumnAndRow = () => makeNewColumnAndRow(table);
    resetEventListeners(table);
}


initTable('table');
const jsonElement = document.getElementById('json');
const tableToJson = document.getElementById('tableToJson');
tableToJson.onclick = function(event) {
    var data = extractTableData('table');
    jsonElement.value = JSON.stringify(data).replaceAll('},{', '},\n{');
};

function extractTableData(tableElementId) {
    const data = [];
    const columnPositionToName = [];
    const table = document.getElementById(tableElementId);
    Array.from(table.getElementsByTagName('th')).forEach((th, i) => {
        columnPositionToName.push(th.textContent);
    });
    const tbody = Array.from(table.getElementsByTagName('tbody'))[0];
    Array.from(tbody.getElementsByTagName('tr')).forEach((tr, trIdx, trArray) => {
        if (trIdx + 1 === trArray.length) {
            return; // ignore the last row
        }
        const row = {};
        data.push(row);
        Array.from(tr.getElementsByTagName('td')).forEach((td, tdIdx, tdArray) => {
            if (tdIdx + 1 === tdArray.length) {
                return; // ignore the last column
            }
            row[columnPositionToName[tdIdx]] = td.textContent;
        });
    });
    return data;
}
