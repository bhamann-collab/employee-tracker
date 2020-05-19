const mysql = require('mysql');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
    host: 'musicdb-g2.cykqhanvgs0f.ap-southeast-2.rds.amazonaws.com',
    port: 3306,
    user: "admin",
    password: "En9VAkHhCBk4Ii3CBJ4L",
    database: "top_songsDB",
    multipleStatements: true
})

async function connect() {
    return new Promise((resolve, reject) => {
        connection.connect(err => {
            if (err) reject(err); // It's not working
            else resolve(); // It's working
        })
    })
}

async function query(command, values) {
    return new Promise((resolve, reject) => {
        connection.query(command, values, (error, results) => {
            if (error) reject(error); // It's not working
            else resolve(results); // It's working
        })
    })
}

async function main() {
    await connect()
    console.log("connected", connection.threadId)

    while(true) {
        const myCommand = await inquirer.prompt({
            name: 'select command',
            type: 'list',
            message: 'What would you like to do?',
            choices: [
                "View all employees",
                "View all roles",
                "Update employee roles",
                'Exit'
            ]
            
        });
        let answer = Object.values(myCommand)[0]

        if(answer === 'Exit') {
            console.log('it works')
            process.exit()
        }

        else if(answer === 'View all employees') {
            const items = await query(`
            USE employee_tracker_brock;
            SELECT * from employee;
        `);
        console.log(items)
        }
    }
}
main()