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
const messageModel = joi.object({
    to: joi.string().required(),
    text: joi.string().required(),
    type:joi.alternatives().try(joi.string().valid('message'), joi.string().valid('message')),
    from: joi.string().required()
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
        mongoClient.close()

    } catch (error) {
        res.sendStatus(500)
        mongoClient.close()
    }
})

app.post('/participants', async (req, res) =>{

    const validation = participantsModel.validate(req.body)
    if (validation.error || req.body.name === "") {
        res.sendStatus(422)
        return
    }

    try {
        const participant = await db.collection('participants').findOne({name : req.body.name})
        if ( participant ) {
            res.sendStatus(409)
            mongoClient.close()
            return  
        }
        const receiveObj = req.body
        await db.collection('participants').insertOne({...receiveObj, lastStatus: Date.now()})
        await db.collection('mensages').insertOne({
            from: receiveObj, 
            to: 'Todos', 
            text: 'entra na sala...', 
            type: 'status', 
            time: dayjs(Date.now()).format('hh:mm:ss')
        })
        res.sendStatus(201)
        mongoClient.close()  

    } catch (error) {
        res.sendStatus(500)
        mongoClient.close()
    }
})

app.delete('/participants/:id', async (req, res) => {
    const id = req.params.id
  
    try {
      await db.collection('participants').deleteOne({ _id: new ObjectId(id) })
      res.sendStatus(200);
      mongoClient.close()

    } catch (error) {
      res.sendStatus(500);
      mongoClient.close()
    }
  });

app.post('/messages', async (req, res) => {

    const bodyMsg = req.body
    const validation = messageModel.validate(bodyMsg)
    const fromDuplicated = await db.collection('messages').findOne({ from:  req.headers.user })
    console.log(fromDuplicated)
    if (validation.error || fromDuplicated) {
        res.sendStatus(422)
        return
    }
    try {
        await db.collection('messages').insertOne({
            ...bodyMsg,
            from: from,
            time: dayjs(Date.now()).format('hh:mm:ss')
        })
        res.sendStatus(201)
        mongoClient.close()

    } catch (error) {
        res.sendStatus(500);
        mongoClient.close()
    }
})
  

app.listen(5000, () => {
    console.log('Server is litening on port 5000.');
  })