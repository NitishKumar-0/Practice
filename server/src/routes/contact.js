import { Router } from 'express'
import { sendContact } from '../services/mailer.js'
const router=Router();const clean=v=>String(v||'').replace(/[<>]/g,'').trim();
router.post('/',async(req,res,next)=>{const name=clean(req.body.name),email=clean(req.body.email),subject=clean(req.body.subject),message=clean(req.body.message);if(!name||name.length>100||!/^\S+@\S+\.\S+$/.test(email)||email.length>254||message.length<10||message.length>5000||subject.length>160)return res.status(400).json({error:'Please provide valid contact details.'});try{await sendContact({name,email,subject,message});res.status(202).json({message:'Message accepted.'})}catch(e){next(e)}});
export default router
