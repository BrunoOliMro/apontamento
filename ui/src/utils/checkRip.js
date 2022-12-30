export default async function checkRipTable(setup, ripTable, extraColumns, message, loader, res, post, pointRipRouter) {
    if (
        Object.values(setup).length <= 0 ||
        Object.values(setup).length < ripTable.length
    ) {
        return (message = "Preencha todos os campos");
    }

    let copyOfExtraCol = extraColumns;
    let extraArrayCollumns = [];
    if (extraColumns.length === 1) {
        extraArrayCollumns.push(copyOfExtraCol + 1);
    }

    const quantityReleased =
        ripTable.length * extraArrayCollumns.length -
        Object.values(setup).length;

    if (quantityReleased === 0) {
        const rows = Object.keys(setup).reduce((acc, iterator) => {
            // if (ripTable[i].LSE === null && ripTable[i].LIE === null) {
            //     ripTable[i].LSE = "OK";
            //     ripTable[i].LIE = "OK";
            // }
            const [col, lin] = iterator.split("-");
            if (acc[lin] === undefined) acc[lin] = {};
            acc[lin][col] = setup[iterator];
            return acc;
        }, {});

        const callSupervisor = Object.values(rows).some((row) => {
            return Object.keys(row)
                .filter((key) => key !== "LIE" && key !== "LSE")
                .some((key) => {
                    let value = row[key];
                    return value < row["LIE"] || value > row["LSE"];
                });
        });

        if (callSupervisor === true) {
            loader = false;
            message = "Supervisor needed";
        } else if (callSupervisor === false) {
            loader = true;
            res = post(pointRipRouter, setup, loader);
        }
    } else if (quantityReleased !== 0) {
        loader = false;
        return (message = "Algo deu errado");
    }
};