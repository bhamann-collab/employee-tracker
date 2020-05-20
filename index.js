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
                "Add employee",
                "Update employee roles",
                'Exit'
            ]
            
        });
        let answer = Object.values(myCommand)[0]

        if(answer === 'Exit') {
            console.log('bye')
            process.exit()
        }

        else if(answer === 'View all employees') {
            const items = await query(`
            USE employee_tracker_brock;
            SELECT employee.first_name, employee.last_name, role.title, departments.name
            FROM employee
            INNER JOIN role ON employee.role_id = role.id
            INNER JOIN departments ON role.department_id = departments.id;
            
        `);
        console.log("first_name last_name title department")
        console.log("_____________________________________")
        items[1].map(arr => {
            console.log(arr.first_name, arr.last_name, arr.title, arr.name)
            })
        }
        else if(answer === 'Add employee') {
            let newEmployee = await addUser()
            console.log(newEmployee)

            //Getting the id of the role
            const roleID = await query(`
            USE employee_tracker_brock;
            SELECT id from role WHERE title="${newEmployee.employee}"
            
        `);
        console.log(newEmployee.first_name)
        console.log(roleID[1][0].id)

            //Adding entry to database
            await query(`
            USE employee_tracker_brock;
            ALTER TABLE employee AUTO_INCREMENT = 1;
            INSERT INTO employee (first_name, last_name, role_id)
            VALUES ('${newEmployee.first_name}', '${newEmployee.last_name}', '${roleID[1][0].id}');
            `);
        }
        else if (answer === 'Update employee roles') {
            let updateUser = await getUser();
            let updateRole = await getRole();
            console.log(updateUser,updateRole)
            let id = convertToNumber(updateUser.name)
            let role = convertToNumber(updateRole.role)
            console.log(id, role)

            //changing entry in database
            await query(`
            USE employee_tracker_brock;
            UPDATE employee
            SET role_id = ${role}
            WHERE id = ${id};
            SELECT * from employee;
            `);
        }
    }
}

async function addUser() {
    let addUserItems = await query(`
    USE employee_tracker_brock;
    SELECT title from role;
`);
    addUserItems = addUserItems[1].map(arr => arr.title)
    return new Promise(resolve => {
        inquirer
        .prompt([
            {
                name: 'first_name',
                message: 'Please enter first name'
            },
            {
                name: 'last_name',
                message: 'Please enter last name'
            },
            {
                type: 'list',
                name: 'employee',
                message: 'Please choose the following role',
                choices: addUserItems
            }
        ]).then(answers => resolve(answers))
    })
}

async function getUser() {
    let modifyUserItems = await query(`
    USE employee_tracker_brock;
    SELECT id, first_name, last_name from employee;
    `);

    modifyUserItems = modifyUserItems[1].map(arr => `${arr.id} ${arr.first_name} ${arr.last_name}`)
    
    console.log(modifyUserItems)
    return new Promise(resolve => {
        inquirer
        .prompt([
            {
                type: 'list',
                name: 'name',
                message: 'Please select employee you want to change',
                choices: modifyUserItems,
                value: 'number'
            }


        ]).then(answers => resolve(answers))
    })
}

async function getRole() {
    let roles = await query(`
    USE employee_tracker_brock;
    SELECT id, title from role;
    `)
    roles = roles[1].map(arr => `${arr.id} ${arr.title}`)

    return new Promise(resolve => {
        inquirer
        .prompt([
            {
                type: 'list',
                name: 'role',
                message: 'Please select role your employee will change into',
                choices: roles
            }
        ]).then(answers => resolve(answers))
    })

}

function convertToNumber(numString) {
    let newNum = ''
    for(let i = 0; i < numString.length; i++) {
        if(numString[i] >= '0' && numString[i] <= '9') {
            newNum += numString.charAt(i)
        } else {
            newNum = parseInt(newNum, 10)
            return newNum
        }
    }
}


main()
//getRole()
