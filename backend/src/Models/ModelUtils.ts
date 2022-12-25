export default class ModelUtils {
    static async assertTableCorrect(
        postgresClient: any,
        tableName: string,
        createTableQuery: string
    ): Promise<void> {
        const errPrefix = `Error with table ${tableName}: `;
        const throwErr = function (err: string) {
            const msg = errPrefix + err;
            console.error(msg);
            throw msg;
        };

        if (tableName != tableName.toLowerCase()) {
            throwErr("Table names should be lowercase");
        }
        if (!createTableQuery.includes("CREATE TABLE")) {
            throwErr("Unexpected query for assertTableCorrect");
        }
        try {
            const expectedColumns =
                this.creationQueryToExpectedColumns(createTableQuery);
            const columnData = await this.tableColumns(
                postgresClient,
                tableName
            );
            const colNames = columnData.map((d) => {
                const name: string = d.column_name;
                return name;
            });
            expectedColumns.forEach((expectedColumn) => {
                if (!colNames.includes(expectedColumn)) {
                    const msg =
                        `Missing column "${expectedColumn}".  Table schema:\n` +
                        JSON.stringify(columnData);
                    throwErr(msg);
                }
            });
        } catch (err: any) {
            throwErr(err);
        }
        console.log(`Table ${tableName} looks good`);
    }

    static async tableColumns(
        postgresClient: any,
        tableName: string
    ): Promise<Array<any>> {
        const q = `
        SELECT table_schema, table_name, column_name, data_type 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE table_name = '${tableName}'`;
        return postgresClient.query(q).then((response: any) => {
            return response.rows;
        });
    }

    static creationQueryToExpectedColumns(
        creationQuery: string
    ): Array<string> {
        const startIndex = creationQuery.indexOf("(");
        const endIndex = creationQuery.indexOf(")");
        const subQuery = creationQuery.substring(startIndex + 1, endIndex);
        const lines = subQuery.split(",").map((ln) => {
            return ln.trim();
        });
        const expectedColumns = lines.map((ln) => {
            return ln.split(" ")[0];
        });
        return expectedColumns;
    }
}
