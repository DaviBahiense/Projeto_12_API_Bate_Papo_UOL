import express from 'express';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from "dotenv";
import cors from "cors"
dotenv.config();

const mongoClient = new MongoClient(process.env.MONGO_URI);
let db;
mongoClient.connect(() => {
    db = mongoClient.db("API_UOL");
  });

const app = express();
app.use(express.json());
app.use(cors());

app.get('/participants', async (req, res) =>{
    try {
        const participants = await db.collection('participants').find().toArray()
        res.send(participants)
    } catch (error) {
        res.sendStatus(500)
    }
})

app.post('/participants', async (req, res) =>{
    try {
        const name = req.body
        db.collection('participants').insertOne(name)
        res.sendStatus(201)
    } catch (error) {
        
    }
})

app.listen(4000, () => {
    console.log('Server is litening on port 4000.');
  })