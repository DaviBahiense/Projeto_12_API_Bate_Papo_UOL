import express from 'express'
import { MongoClient, ObjectId } from 'mongodb'
import dotenv from "dotenv"
import cors from "cors"
import joi from 'joi'
import dayjs from 'dayjs'

dotenv.config();

const participantsModel = joi.object({
    name: joi.string().required()
})

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

    const validation = participantsModel.validate(req.body);

    if (validation.error || req.body.name === "") {
        res.sendStatus(422);
        return
    }

    try {
        const participant = await db.collection('participants').findOne({name : req.body.name})
        if ( participant ) {
            res.sendStatus(409);
            return  
        }
        const receiveObj = req.body
        await db.collection('participants').insertOne({...receiveObj, lastStatus: Date.now()})
        await db.collection('mensage').insertOne({from: receiveObj, to: 'Todos', text: 'entra na sala...', type: 'status', time: dayjs(Date.now()).format('hh:mm:ss')})
        res.sendStatus(201) 
    } catch (error) {
        res.sendStatus(500);
    }
})

app.delete('/participants/:id', async (req, res) => {
    const id = req.params.id;
  
    try {
      await db.collection('participants').deleteOne({ _id: new ObjectId(id) })
  
      res.sendStatus(200);
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });
  

app.listen(5000, () => {
    console.log('Server is litening on port 5000.');
  })