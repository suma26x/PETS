const express = require('express');
const mysql = require('mysql2');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'YOUR_MYSQL_PASSWORD',
    database: 'petcare_db'
});

db.connect((err) => {
    if (err) {
        console.log('Database Connection Failed:', err.message);
    } else {
        console.log('Database Connected Successfully!');
    }
});

// Home page
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

// Register owner and pet
app.post('/register', (req, res) => {
    const { owner_name, phone, email, address,
            pet_name, pet_type, breed, age } = req.body;

    const ownerSql = `INSERT INTO owner
    (owner_name, phone, email, address) VALUES (?, ?, ?, ?)`;

    db.query(ownerSql, [owner_name, phone, email, address], (err, result) => {
        if (err) return res.send('Owner Registration Failed: ' + err.message);

        const ownerId = result.insertId;

        const petSql = `INSERT INTO pet
        (pet_name, pet_type, breed, age, owner_id)
        VALUES (?, ?, ?, ?, ?)`;

        db.query(petSql, [pet_name, pet_type, breed, age, ownerId], (err) => {
            if (err) return res.send('Pet Registration Failed: ' + err.message);

            res.send('Owner and Pet Registered Successfully!');
        });
    });
});

// Display pets
app.get('/pets', (req, res) => {
    const sql = `SELECT pet.*, owner.owner_name
                 FROM pet JOIN owner
                 ON pet.owner_id = owner.owner_id`;

    db.query(sql, (err, results) => {
        if (err) return res.send(err.message);
        res.json(results);
    });
});

// Display services
app.get('/services', (req, res) => {
    db.query('SELECT * FROM services', (err, results) => {
        if (err) return res.send(err.message);
        res.json(results);
    });
});

// Book appointment
app.post('/appointment', (req, res) => {
    const { pet_id, doctor_id, appointment_date, description } = req.body;

    const sql = `INSERT INTO appointment
    (pet_id, doctor_id, appointment_date, description)
    VALUES (?, ?, ?, ?)`;

    db.query(sql, [pet_id, doctor_id, appointment_date, description], (err) => {
        if (err) return res.send('Booking Failed: ' + err.message);
        res.send('Appointment Booked Successfully!');
    });
});

// Start server
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});