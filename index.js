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
        'Update an employee role',
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
  db.query('SELECT * FROM role', (err, res) => {
    if (err) throw err;
    const roles = res.map((r) => ({ name: r.title, value: r.id }));
    db.query('SELECT * FROM employee', (err1, res1) => {
      const employees = res1.map((r) => ({ name: r.first_name, value: r.id }));
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
            type: 'list',
            name: 'role_id',
            message: 'What is the employees role?',
            choices: roles,
          },
          {
            type: 'list',
            name: 'manager_id',
            message: 'Who is the employees manager?',
            choices: employees,
          },
        ])
        .then((userChoice) => {
          console.log(userChoice);
          db.query(
            'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES(?, ?, ?, ?)',
            [
              userChoice.first_name,
              userChoice.last_name,
              userChoice.role_id,
              userChoice.manager_id,
            ],
            (err, res) => {
              if (err) throw err;
              console.log(
                `${userChoice.first_name} and ${userChoice.last_name} have been added`
              );
              startQuery();
            }
          );
        });
    });
  });
};

// const updateEmployee = () => {
//   db.query('SELECT * FROM role', (err, res) => {
//     if (err) throw err;
//     const roles = res.map((r) => ({ name: r.title, value: r.id }));
//     db.query('SELECT * FROM employee', (err1, res1) => {
//       const employees = res1.map((r) => ({
//         name: r.first_name,
//         value: r.id,
//       }));
//       inquirer
//         .prompt([
//           {
//             type: 'list',
//             name: 'id',
//             message: 'Which employees role do you want to update?',
//             choices: employees,
//           },
//           {
//             type: 'list',
//             name: 'title',
//             message: 'Which role do you want to assign the selected employee',
//             choices: roles,
//           },
//         ])
//         .then((userChoice) => {
//           console.log(userChoice);
//           db.query(
//             'UPDATE employee SET name=title WHERE id=employee_id',
//             [userChoice.employee_id, userChoice.title],
//             (err, res) => {
//               if (err) throw err;
//               console.log('Updated employees role');
//               startQuery();
//             }
//           );
//         });
//     });
//   });
// };

const updateEmployee = () => {
  return db.query(
    'SELECT employee.first_name, employee.last_name, employee.id, role.title, role.id FROM employee LEFT JOIN role ON employee.id = role.id',
    (err, res) => {
      inquirer
        .prompt([
          {
            name: 'employee',
            type: 'list',
            choices() {
              console.log('response console log', res);
              return res.map(({ first_name, last_name, id }) => {
                return { name: first_name + ' ' + last_name, value: id };
              });
            },
            message: 'select employee to update ',
          },
          {
            name: 'role',
            type: 'list',
            choices() {
              return res.map(({ id, title }) => {
                return { name: title, value: id };
              });
            },
            message: 'select new role',
          },
        ])
        .then((answer) => {
          db.query(
            'UPDATE  employee SET ? WHERE ?',
            [
              {
                role_id: answer.role,
              },
              {
                id: answer.employee,
              },
            ],
            function (err, res) {
              if (err) throw err;
              console.log(`the ${answer.employee} role has been updated`);
              startQuery();
            }
          );
        });
    }
  );
};

// [
//   {
//     role_id: userChoice.role
//   },
//   id: userChoice.employee
// ]

(async () => await startQuery())();
