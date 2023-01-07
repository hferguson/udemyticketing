import express, {Request, Response} from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import {Password } from '../services/password';
import {User } from '../models/users';
import { validateRequest, BadRequestError } from '@hftickets67/common';


const router = express.Router();

router.post('/api/users/signin', 
[
   body('email')
      .isEmail()
      .withMessage('Must be a valid email address'),
      body('password')
      .trim()
      .notEmpty()
      .withMessage('You must supply a password')
],
validateRequest,
async (req : Request, res : Response) => {
   const {email, password} = req.body;
   
   const existingUser = await User.findOne({ email });
   if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
   }
   const passwordsMatch = await Password.compare(existingUser.password, password);
   if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
   }
   // Generate JWT 
   const userJwt = jwt.sign({
   id: existingUser.id,
   email: existingUser.email
   }, process.env.JWT_KEY!); // ! at the end means that we know that this is set elsewhere, so TS doesn't need to flag it

   // Store on session object
   req.session = {
      jwt: userJwt
   };
   res.status(200).send(existingUser);
});

export {router as signinRouter };