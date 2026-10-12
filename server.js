
const express = require("express");
const app = express();

app.use(express.json());

let employees = [
    { id: 1, name: "Aman", department: "IT", salary: 35000 },
    { id: 2, name: "Priya", department: "HR", salary: 40000 }
];

app.use((req, res, next) => {
    console.log(req.method, req.url);
    next();
});

function validateEmployee(req, res, next) {
    const { name, department, salary } = req.body;

    if (
        typeof name !== "string" || !name.trim() ||
        typeof department !== "string" || !department.trim() ||
        salary === undefined ||
        salary === null ||
        salary === "" ||
        !Number.isFinite(Number(salary)) ||
        Number(salary) < 0
    ) {
        return res.status(400).json({
            message: "Valid name, department and salary are required"
        });
    }

    next();
}

app.get("/", (req, res) => {
    res.send("Employee Service API is running");
});

app.get("/employees", (req, res) => {
    let result = [...employees];

    if (req.query.department) {
        result = result.filter(
            e => e.department.toLowerCase() ===
                req.query.department.toLowerCase()
        );
    }

    if (req.query.name) {
        result = result.filter(
            e => e.name.toLowerCase().includes(
                req.query.name.toLowerCase()
            )
        );
    }

    res.status(200).json(result);
});

app.get("/employees/:id", (req, res) => {
    const employee = employees.find(
        e => e.id === Number(req.params.id)
    );

    if (!employee) {
        return res.status(404).json({
            message: "Employee not found"
        });
    }

    res.json(employee);
});

app.post("/employees", validateEmployee, (req, res) => {
    const employee = {
        id: employees.reduce((max, e) => Math.max(max, e.id), 0) + 1,
        name: req.body.name.trim(),
        department: req.body.department.trim(),
        salary: Number(req.body.salary)
    };

    employees.push(employee);

    res.status(201).json({
        message: "Employee created",
        employee
    });
});

app.put("/employees/:id", validateEmployee, (req, res) => {
    const id = Number(req.params.id);
    const index = employees.findIndex(e => e.id === id);

    if (index === -1) {
        return res.status(404).json({
            message: "Employee not found"
        });
    }

    employees[index] = {
        id,
        name: req.body.name.trim(),
        department: req.body.department.trim(),
        salary: Number(req.body.salary)
    };

    res.json(employees[index]);
});

app.patch("/employees/:id", (req, res) => {
    const employee = employees.find(
        e => e.id === Number(req.params.id)
    );

    if (!employee) {
        return res.status(404).json({
            message: "Employee not found"
        });
    }

    const { name, department, salary } = req.body;

    if (
        (name !== undefined &&
            (typeof name !== "string" || !name.trim())) ||
        (department !== undefined &&
            (typeof department !== "string" || !department.trim())) ||
        (salary !== undefined &&
            (salary === null || salary === "" ||
                !Number.isFinite(Number(salary)) ||
                Number(salary) < 0))
    ) {
        return res.status(400).json({
            message: "Invalid employee details"
        });
    }

    if (name !== undefined) employee.name = name.trim();
    if (department !== undefined) employee.department = department.trim();
    if (salary !== undefined) employee.salary = Number(salary);

    res.json(employee);
});

app.delete("/employees/:id", (req, res) => {
    const id = Number(req.params.id);
    const oldLength = employees.length;

    employees = employees.filter(e => e.id !== id);

    if (employees.length === oldLength) {
        return res.status(404).json({
            message: "Employee not found"
        });
    }

    res.json({ message: "Employee deleted" });
});

app.get("/employees/count", (req, res) => {
    res.json({ count: employees.length });
});

app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Something went wrong" });
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
