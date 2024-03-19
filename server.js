const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_hr_db');

const express = require('express');
const app = express();

app.use(express.json());
app.use(require('morgan')('dev'));
app.use((error, req, res, next) => {
    res.status(res.status || 500).send({error: error});
})

app.get('/api/employees', async (req, res, next) => {
    try {
        const SQL = /*sql*/ `
            SELECT * FROM employees ORDER BY department_id ASC;
        `;

        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (err) {
        next(err);
    }
});

app.get('/api/department', async (req, res, next) => {
    try {
        const SQL = /*sql*/ `
            SELECT * FROM department ORDER BY id ASC;
        `;

        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (err) {
        next(err);
    }
});

app.post('/api/employees', async (req, res, next) => {
    try {
        const SQL = /*sql*/ `
            INSERT INTO employees(name, department_id) VALUES ($1, $2);
        `;

        const response = await client.query(SQL, [req.body.name, req.body.department_id]);
        res.send(response.rows[0]);
    } catch (err) {
        next(err);
    }
});

app.put('/api/employees/:id', async (req, res, next) => {
    try {
        const SQL = /*sql*/ `
            UPDATE employees SET name=$1, department_id=$2, updated_at=now()
            WHERE id=$3;
        `;

        const response = await client.query(SQL, [req.body.name, req.body.department_id, req.params.id]);
        res.send(response.rows[0]);
    } catch (err) {
        next(err);
    }
});

app.delete('/api/employees/:id', async (req, res, next) => {
    try {
        const SQL = /*sql*/ `
            DELETE FROM employees WHERE id=$1;
        `;

        const response = await client.query(SQL, [req.params.id]);
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
});

const init = async () => {
    await client.connect();

    let SQL = /*sql*/ `
    DROP TABLE IF EXISTS employees;
    DROP TABLE IF EXISTS department;
        CREATE TABLE department(
            id SERIAL PRIMARY KEY NOT NULL,
            name VARCHAR(50) NOT NULL
        );
        CREATE TABLE employees(
            id SERIAL PRIMARY KEY NOT NULL,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT now(),
            updated_at TIMESTAMP DEFAULT now(),
            department_id INTEGER REFERENCES department(id) NOT NULL
        );
    `;

    client.query(SQL);
    console.log('Tables Created!');

    SQL = /*sql*/ `
    INSERT INTO department(name) VALUES ('Human Resources');
    INSERT INTO department(name) VALUES ('IT');
    INSERT INTO department(name) VALUES ('Accounting');
    INSERT INTO department(name) VALUES ('Sales');

    INSERT INTO employees(name, department_id) VALUES ('Brett', 2);
    INSERT INTO employees(name, department_id) VALUES ('Laura', 4);
    INSERT INTO employees(name, department_id) VALUES ('Matt', 1);
    INSERT INTO employees(name, department_id) VALUES ('David', 2);
    INSERT INTO employees(name, department_id) VALUES ('Lee', 3);
    INSERT INTO employees(name, department_id) VALUES ('John', 1);
    `;

    client.query(SQL);
    console.log('Data Entered!');

    const port = process.env.PORT || '3000';
    app.listen(port, () => console.log(`Listening on port ${port}!`));
};

init();