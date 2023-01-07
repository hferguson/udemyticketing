import express from 'express';
import {currentUser } from '@hftickets67/common';

const router = express.Router();

// currentUser is our function/middleware.  When passed in as the second argument, 
// express calls it before returning. The middleware sets currentUser obj on req
router.get('/api/users/currentuser', currentUser, (req, res) => {
  
  res.send({currentUser: req.currentUser || null});
});

export {router as currentUserRouter };
