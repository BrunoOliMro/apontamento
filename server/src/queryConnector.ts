import { sqlConfig } from "./global.config";
import sql from 'mssql'

export const poolConnection: any = async () => {
    // console.log('sql', sql);
    // var sql = require('mssql');
    // var client = sql.createConnection();
    // client.connect(sqlConfig);
    // console.log('Connected');
    // var result = client.exec("SELECT * FROM MOTIVO_DEVOLUCAO");


    // console.log(result);



    // const Connection = require('tedious').Connection
    // const Request = require('tedious').Request

    
    // const connection = new Connection(sqlConfig)
    
    // connection.on('connect', (err: any) => {
    //     console.log('irbibib ');
    //   if (err) {
    //     console.log(err)
    //   } else {
    //     executeStatement()
    //   }
    // })
    
    // function executeStatement () {
    //   var request = new Request("select 123, 'hello world'", (err: any, rowCount: any) => {
    //     if (err) {
    //       console.log(err)
    //     } else {
    //       console.log(`${rowCount} rows`)
    //     }
    //     connection.close()
    //   })
    
    //   request.on('row', (columns: any) => {
    //     columns.forEach((column: any) => {
    //       if (column.value === null) {
    //         console.log('NULL')
    //       } else {
    //         console.log(column.value)
    //       }
    //     })
    //   })
    
    //   connection.execSql(request)
    // }








    // var client = await sql.connect(sqlConfig)
    // console.log('client', client);


    // console.log('ribhnibnirbni');







    return await new sql.ConnectionPool(sqlConfig).connect().then(pool => { return pool })
    // const poolPromise = new sql.ConnectionPool(sqlConfig, () => {

    // })
    // const sql = require('mssql')
    // console.log('sql', sql);
    // sql.connect(sqlConfig, (err: any ) => {
    //     console.log('connected');
    //     if(err){
    //         console.log('error on connectingo to database');
    //     }
    // })

    //     sql.connect(sqlConfig)
    //     // connection.connect();

    // var request = new sql.Request();
    // console.log('request', request);
    // request.query('SELECT * FROM MOTIVO_DEVOLUCAO', function (err: any, recordset: any) {
    //     console.log('err', err);
    //     console.log('recordset', recordset);
    // });

    //     sql.connect(sqlConfig, (err: any ) => {
    //         console.log('connected');
    //         if(err){
    //             console.log('error on connectingo to database');
    //         }
    //     })

    //     await sql.query( 'SELECT * FROM MOTIVO_DEVOLUCAO' , (err: any) => {
    //         console.log('err', err);
    //     })

    //     const x  = new sql.PreparedStatement('SELECT * FROM MOTIVO_DEVOLUCAO')
    //     console.log('x', x);
    // return connection.connect(function(err: any) {
    //     if (err) throw err;
    // });

    // return connection

    // var Connection = require('tedious').Connection
    // var connection = new Connection(sqlConfig);  
    // connection.on('connect', (err: any) => {  
    //     // If no error, then good to proceed.
    //     console.log("Connected");  
    // });
    // connection.connect();

    // var Request = require('tedious').Request

    // var request = new Request('SELECT DESCRICAO FROM MOTIVO_DEVOLUCAO', (err: any, rowCount: any, rows: any) => {
    //     console.log('err', err);
    //     console.log('rowCount', rowCount);
    //     console.log('rows', rows);
    // } )

    // const x  = await connection.execSql(request)

    // console.log('requesteeeeeeeee', request);
    // console.log('x', x);


    // const x: any = await new sql.ConnectionPool(sqlConfig)

    // if (x['_connected'] === false) {
    //     return x.connect()
    //         .then((pool: any) => {
    //             return pool
    //         }).catch((err: any) => {
    //             console.log('error on conectingo to database', err)
    //             return err
    //         })
    // } else {
    //     return pool
    // }
}