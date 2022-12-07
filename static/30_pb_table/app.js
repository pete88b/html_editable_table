/*
# options
- can add columns
- can add rows
- can edit column names

pbTable('tableId', {'canAddColumns':' true', 'canAddRows': true, 'canEditColumnNames': true})

# so we always have
- keyboard navigation
- row hiding
*/

class PbTable {
    tableElementId = null;
    canAddColumns = true;
    canAddRows = true;
    canEditColumnNames = true;
    constructor (tableElementId, canAddColumns=true, canAddRows=true, canEditColumnNames=true) {
        this.table = document.getElementById(tableElementId);
        this.table.pbTable = this;
        this.canAddColumns = canAddColumns;
        this.canAddRows = canAddRows;
        this.canEditColumnNames = canEditColumnNames;
        ['onkeydownHandler', 'makeNewRow', 'makeNewColumn', 'makeNewColumnAndRow'].forEach(fn => {
            this[fn] = this[fn].bind(this);
        });
    }
    get data () {
        return this.getData();
    }
    set data(tableData) {
        this.setData(tableData);
    }
}

PbTable.prototype.columnIndexOfCell = function (cell) { // th or td
    const children = cell.parentElement.children;
    for (let i = 0; i < children.length; i++) {
        if (children[i] === cell) {
            return i;
        }
    }
    throw `failed to find cell in parents children ${cell}`
}

PbTable.prototype.toggleColumnHidden = function (cell) {
    const columnIndex = this.columnIndexOfCell(cell);
    const th = Array.from(this.table.getElementsByTagName('th'))[columnIndex];
    const hidden = th.classList.contains('hidden'); // use hidden state of column when adding new rows
    Array.from(this.table.getElementsByTagName('tr')).forEach(tr => {
        const child = Array.from(tr.children)[columnIndex];
        if (hidden) {
            child.classList.remove('hidden');
        } else {
            child.classList.add('hidden');
        }
    });
}

PbTable.prototype.onkeydownHandler = function (event) {
    // nav
    // hide
    if (event.altKey && (event.key == 'ArrowLeft' || event.key == 'ArrowRight')) {
        if (event.target.tagName == 'TD') {
            event.target.parentElement.classList.toggle('hidden'); // toggle row hidden
        }
        event.preventDefault();
    }
    if (event.altKey && (event.key == 'ArrowUp' || event.key == 'ArrowDown')) {
        this.toggleColumnHidden(event.target);
        event.preventDefault();
    }
}


PbTable.prototype.newTh = function (columnName) {
    const th = document.createElement('th');
    if (this.canEditColumnNames) {
        th.contentEditable = 'true';
    }
    th.textContent = columnName;
    th.onkeydown = this.onkeydownHandler;
    return th;
}

PbTable.prototype.newTd = function (columnName, value) {
    const td = document.createElement('td');
    td.contentEditable = "true";
    td.textContent = value;
    td.onkeydown = this.onkeydownHandler;
    return td;
}

PbTable.prototype.makeNewColumn = function () {
    if (!this.canAddColumns) {
        return;
    }
    const ths = Array.from(this.table.getElementsByTagName('th'));
    const th = ths[ths.length - 1];
    if (th.textContent == '') {
        const columnCount = this.table.getElementsByTagName('th').length;
        th.textContent = `Column ${columnCount}`;
    }
    Array.from(this.table.getElementsByTagName('tr')).forEach((tr, i) => {
        tr.append((i == 0) ? this.newTh('') : this.newTd(''));
    });
    this.resetNewColumnAndRowListeners();
}

PbTable.prototype.makeNewRow = function () {
    if (!this.canAddRows) {
        return;
    }
    const tr = document.createElement('tr');
    const tbody = Array.from(this.table.getElementsByTagName('tbody'))[0];
    tbody.append(tr);
    Array.from(this.table.getElementsByTagName('th')).forEach((th, i) => {
        const td = this.newTd(th.textContent, '');
        tr.append(td);
    });
    this.resetNewColumnAndRowListeners();
}

PbTable.prototype.makeNewColumnAndRow = function () {
    this.makeNewColumn();
    this.makeNewRow();
}

PbTable.prototype.resetNewColumnAndRowListeners = function () {
    Array.from(this.table.getElementsByTagName('tr')).forEach((tr, trIdx, trArray) => {
        Array.from(tr.children).forEach((cell, tdIdx, tdArray) => {
            [this.makeNewColumn, this.makeNewRow, this.makeNewColumnAndRow].forEach(fn => cell.removeEventListener('input', fn));
            const lastColumn = (tdIdx + 1 === tdArray.length);
            const lastRow = (trIdx + 1 === trArray.length);
            if (lastColumn & lastRow) {
                cell.addEventListener('input', this.makeNewColumnAndRow);
            } else if (lastColumn) {
                cell.addEventListener('input', this.makeNewColumn);
            } else if (lastRow) {
                cell.addEventListener('input', this.makeNewRow);
            }
        });
    });
}

PbTable.prototype.setData = function (tableData) {
    // remove existing table content 
    Array.from(this.table.children).forEach(child => this.table.removeChild(child));
    // populate table content
    const thead = document.createElement('thead');
    this.table.append(thead);
    let tr = document.createElement('tr');
    thead.append(tr);
    let row = tableData[0];
    const columnNames = Object.keys(row);
    if (this.canAddColumns) {
        columnNames.push('');
    }
    columnNames.forEach(columnName => {
        tr.append(this.newTh(columnName));
    });
    const tbody = document.createElement('tbody');
    this.table.append(tbody);
    tableData.forEach(row => {
        const tr = document.createElement('tr');
        tbody.append(tr);
        columnNames.forEach(columnName => {
            tr.append(this.newTd(columnName, row[columnName]));
        });
    });
    this.makeNewRow();
};

PbTable.prototype.getData = function () {
    const data = [];
    const columnPositionToName = [];
    const columnPositionToHidden = [];
    Array.from(this.table.getElementsByTagName('th')).forEach((th, i) => {
        columnPositionToName.push(th.textContent);
        columnPositionToHidden.push(th.classList.contains('hidden'));
    });
    const tbody = Array.from(this.table.getElementsByTagName('tbody'))[0];
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
};

const demoData = [
    {col1:'a', col2:'bx'},
    {col1:'a2', col2:'b2'},
    {col1:'A3', col2:'b3.3'}
];
// constructor (tableElementId, canAddColumns=true, canAddRows=true, canEditColumnNames=true)
const pbTable = new PbTable('table', false, false, false);
pbTable.data = demoData;

const jsonElement = document.getElementById('json');
jsonElement.value = JSON.stringify(demoData).replaceAll('},{', '},\n{');
const tableToJson = document.getElementById('tableToJson');
tableToJson.onclick = function(event) {
    let data = pbTable.data;
    console.log(data);
    jsonElement.value = JSON.stringify(data).replaceAll('},{', '},\n{');
};
const jsonToTable = document.getElementById('jsonToTable');
jsonToTable.onclick = function(event) {
    pbTable.data = JSON.parse(jsonElement.value);
};
