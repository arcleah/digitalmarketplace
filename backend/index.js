import express from "express"
import mysql from "mysql"
import cors from "cors"

const app = express()

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "cpsc471",
    database: "resellStore"
})

app.get("/", (req,res)=>{
    res.json("Hello this is the backend")
})

app.get("/member", (req, res)=>{
    const q = "SELECT * FROM member"
    db.query(q, (err,data)=>{
        if (err) return res.json(err)
        return res.json(data)
    })
})

// Get items based on member
app.get("/items/member", (req, res)=>{
    const memberId = req.query.member_id;
    const q = "SELECT * FROM items WHERE member_id = ?";
    db.query(q, [memberId], (err,data)=>{
        if (err) return res.json(err);
        return res.json(data);
    });
});

// Get all items
app.get("/items", (req, res)=>{
    const q = "SELECT * FROM items"
    db.query(q, (err,data)=>{
        if (err) return res.json(err);
        return res.json(data);
    });
});

app.post("/items", (req, res) => {
    const { item_name, item_condition, size, description, price, item_photo, member_id } = req.body;
  
    // Validate that member_id is included
    if (!member_id) {
      return res.status(400).json({ message: "Member ID is required." });
    }
  
    const q = `
      INSERT INTO items 
      (item_name, item_condition, size, description, price, item_photo, member_id) 
      VALUES (?)`;
  
    const values = [
      item_name,
      item_condition,
      size,
      description,
      price,
      item_photo,
      member_id, // member_id is passed here
    ];
  
    db.query(q, [values], (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json("Item has been created");
    });
  });
  

// Sign-up Endpoint
app.post("/api/signup", (req, res) => {
    const { fname, lname, address, email, password, phone, role } = req.body;
    const q = "INSERT INTO member (fname, lname, address, email, password, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(q, [fname, lname, address, email, password, phone, role], (err, result) => {
        if (err) return res.status(500).json(err);
        return res.status(200).json("User registered successfully!");
    });
});

// Login Endpoint
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    const q = "SELECT * FROM member WHERE email = ? AND password = ?";
    db.query(q, [email, password], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(401).json("Invalid email or password");
       
        const user = {
            member_id: data[0].id, // Ensure member_id is included
            name: data[0].fname,
            role: data[0].role, // Include role in the response
        };
        console.log(data); // Check what data is coming from the DB
        return res.status(200).json({ member_id: data[0].id, name: data[0].fname, role:data[0].role});
    });
});
app.get("/test-db", (req, res) => {
    db.query("SELECT 1", (err, result) => {
        if (err) {
            console.error("Database connection failed:", err.message);
            return res.status(500).json({ message: "Database connection failed." });
        }
        res.status(200).json({ message: "Database connection successful!" });
    });
});
app.listen(8800, () =>{
    console.log("Connected to backend!")
})