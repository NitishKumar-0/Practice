import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import contactRouter from './routes/contact.js'
const app=express();
const origins=(process.env.CLIENT_ORIGIN||'http://localhost:5173').split(',').map(x=>x.trim());
app.use(helmet());app.use(cors({origin(origin,cb){if(!origin||origins.includes(origin))return cb(null,true);cb(new Error('Origin not allowed'))},methods:['POST'],optionsSuccessStatus:204}));app.use(express.json({limit:'12kb'}));app.use('/api/contact',rateLimit({windowMs:15*60*1000,max:5,standardHeaders:true,legacyHeaders:false,message:{error:'Too many messages. Please try again later.'}}),contactRouter);app.use((err,req,res,next)=>{console.error(err.message);res.status(err.message==='Origin not allowed'?403:500).json({error:'Unable to process this request.'})});
export default app
