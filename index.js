const db = require('./server');
const inquirer = require('inquirer');
const cTable = require('console.table');

//create connection to connect to our database

db.connect((err) => {
  if (err) throw err;
  console.log(`connect to db as ${db.threadId}`);
});

//start user query

const startQuery = () => {
  inquirer
    .prompt({
      type: 'list',
      name: 'choices',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update employee role',
        'Exit',
      ],
    })
    .then((userSelection) => {
      switch (userSelection.choices) {
        case 'View all departments':
          viewDepartments();
          break;
        case 'View all roles':
          viewRoles();
          break;
        case 'View all employees':
          viewEmployees();
          break;
        case 'Add a department':
          addDepartment();
          break;
        case 'Add a role':
          addRole();
          break;
        case 'Add an employee':
          addEmployee();
          break;
        case 'Update an employee role':
          updateEmployee();
        case 'exit':
          db.end();
          break;
        default:
          db.end();
      }
    });
};

const viewDepartments = () => {
  db.query('SELECT * FROM department', function (err, res) {
    if (err) throw err;
    console.table(res);
    startQuery();
  });
};

const viewRoles = () => {
  db.query('SELECT * FROM role', function (err, res) {
    if (err) throw err;
    console.table(res);
    startQuery();
  });
};

const viewEmployees = () => {
  db.query('SELECT * FROM employee', function (err, res) {
    if (err) throw err;
    console.table(res);
    startQuery();
  });
};

const addDepartment = () => {
  inquirer
    .prompt({
      type: 'input',
      name: 'name',
      message: 'What is the department name',
    })
    .then((answer) => {
      const queryQs = 'INSERT INTO department SET ?';
      db.query(queryQs, answer, (err, res) => {
        if (err) throw err;
        console.log(`${answer.name} has been added`);
        startQuery();
      });
    });
};

const addRole = () => {
  db.query('SELECT * FROM department', (err, res) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'title',
          message: 'Please add a new role name',
        },
        {
          type: 'input',
          name: 'salary',
          message: 'Please enter a salary amount',
        },
        {
          type: 'list',
          name: 'department_id',
          message: 'Which department does the role belong to?',
          choices() {
            return res.map(({ id, name }) => {
              return { name: name, value: id };
            });
          },
        },
      ])
      .then((userChoice) => {
        db.query('INSERT INTO role SET ?', userChoice, (err, res) => {
          if (err) throw err;
          console.log(`${userChoice.title} has been added`);
          startQuery();
        });
      });
  });
};

const addEmployee = () => {
  db.query('SELECT * FROM employee', (err, res) => {
    if (err) throw err;
    inquirer
      .prompt([
        {
          type: 'input',
          name: 'first_name',
          message: 'Please enter the employees first name',
        },
        {
          type: 'input',
          name: 'last_name',
          message: 'Please enter the employees last name',
        },
        {
          type: 'input',
          name: 'role_id',
          message: 'What is the employees role?',
        },
        {
          type: 'input',
          name: 'manager_id',
          message: 'Who is the employees manager?',
          choices() {
            return res.map(({ first_name, last_name, role_id, manager_id }) => {
              return {
                name: first_name + ' ' + last_name,
                role: role_id,
                manager: manager_id,
              };
            });
          },
        },
      ])
      .then((userChoice) => {
        db.query('INSERT INTO employee SET ?', userChoice, (err, res) => {
          if (err) throw err;
          console.log(
            `${userChoice.first_name} and ${userChoice.last_name} have been added`
          );
          startQuery();
        });
      });
  });
};
// [
//   {
//     role_id: userChoice.role
//   },
//   id: userChoice.employee
// ]

(async () => await startQuery())();