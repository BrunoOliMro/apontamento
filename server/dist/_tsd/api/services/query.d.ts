import mssql from 'mssql';
export declare const selectQuery: (chosenOption: number, values?: any) => Promise<{
    message: string | undefined;
    data: mssql.IRecordSet<any>;
} | {
    message: string | undefined;
    data: string | undefined;
}>;
//# sourceMappingURL=query.d.ts.map