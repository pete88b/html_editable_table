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
    let data = extractTableData('table');
    jsonElement.value = JSON.stringify(data).replaceAll('},{', '},\n{');
};

function getCellPosition(cell) {
    const table = cell.parentElement.parentElement.parentElement;
    const trs = Array.from(table.getElementsByTagName('tr'));
    for (let rowIdx = 0; rowIdx < trs.length; rowIdx++) {
        const cells = Array.from(trs[rowIdx].children);
        for (let columnIdx = 0; columnIdx < cells.length; columnIdx++) {
            if (cell == cells[columnIdx]) {
                return [rowIdx, columnIdx];
            }
        }
    }
    throw `failed to find cell in table ${cell}`
}

function getCellByPosition(table, rowIdx, columnIdx) {
    if (rowIdx < 0 || columnIdx < 0) {
        return;
    }
    const trs = Array.from(table.getElementsByTagName('tr'));
    if (rowIdx >= trs.length) {
        return;
    }
    const cells = Array.from(trs[rowIdx].children);
    return cells[columnIdx];
}

function addKeyboardNavigation(tableElementId) {
    const table = document.getElementById(tableElementId);
    const trs = Array.from(table.getElementsByTagName('tr'));
    for (let rowIdx = 0; rowIdx < trs.length; rowIdx++) {
        const cells = Array.from(trs[rowIdx].children);
        for (let columnIdx = 0; columnIdx < cells.length; columnIdx++) {
            const cell = cells[columnIdx];
            cell.onkeydown = (event) => {
                if (event.ctrlKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
                    const cellPosition = getCellPosition(cell);
                    let rowIdx = cellPosition[0];
                    let columnIdx = cellPosition[1];
                    if (event.key == 'ArrowLeft') {
                        columnIdx--;
                    } else if (event.key == 'ArrowRight') {
                        columnIdx++;
                    } else if (event.key == 'ArrowUp') {
                        rowIdx--;
                    } else {
                        rowIdx++;
                    }
                    const cellToMoveTo = getCellByPosition(table, rowIdx, columnIdx);
                    if (cellToMoveTo) {
                        cellToMoveTo.focus();
                    }
                    // console.log('xxx', cellPosition, rowIdx, columnIdx, getCellByPosition(table, rowIdx, columnIdx)?.textContent);
                    event.preventDefault();
                }
            }
        }
    }
}

addKeyboardNavigation('table');