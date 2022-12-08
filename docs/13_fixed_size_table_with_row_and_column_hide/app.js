
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

function addRowAndColumnHide(tableElementId) {
    const table = document.getElementById(tableElementId);
    Array.from(table.getElementsByTagName('th')).forEach((th, i) => {
        th.onkeydown = (event) => {
            if (event.altKey && (event.key == 'ArrowUp' || event.key == 'ArrowDown')) {
                toggleColumnHidden(table, th);
                event.preventDefault();
            }
        };
    });
    const tbody = Array.from(table.getElementsByTagName('tbody'))[0];
    Array.from(tbody.getElementsByTagName('tr')).forEach((tr, trIdx, trArray) => {
        Array.from(tr.getElementsByTagName('td')).forEach((td, tdIdx, tdArray) => {
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
        });
    });
}

addRowAndColumnHide('table');

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
        if (tr.classList.contains('hidden')) {
            return; // ignore hidden rows
        }
        const row = {};
        data.push(row);
        Array.from(tr.getElementsByTagName('td')).forEach((td, tdIdx, tdArray) => {
            if (columnPositionToHidden[tdIdx]) {
                return; // ignore hidden columns
            }
            row[columnPositionToName[tdIdx]] = td.textContent;
        });
    });
    return data;
}

const jsonElement = document.getElementById('json');
const tableToJson = document.getElementById('tableToJson');
tableToJson.onclick = function(event) {
    let data = extractTableData('table');
    jsonElement.value = JSON.stringify(data).replaceAll('},{', '},\n{');
};
