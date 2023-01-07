import express, {Request, Response } from 'express';
import {body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@hftickets67/common';
import {User } from '../models/users';

const router = express.Router();

router.post('/api/users/signup', [
    body('email')
      .isEmail()
      .withMessage('Not a valid email'),
    body('password')
      .trim()
      .isLength({min:4, max:20})
      .withMessage('Password must be between 4 and 20 characters')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
  
    const {email, password } = req.body;
    const existingUser = await User.findOne({email});

    if (existingUser) {
      throw new BadRequestError("Email in use");
    }
    //console.log("Creating a user...");
    const user = User.build({ email, password});
    await user.save();

    // Generate JWT 
    const userJwt = jwt.sign({
      id: user.id,
      email: user.email
    }, process.env.JWT_KEY!); // ! at the end means that we know that this is set elsewhere, so TS doesn't need to flag it

    // Store on session object
    req.session = {
      jwt: userJwt
    };

    res.status(201).send(user);

  }
);

export {router as signupRouter };