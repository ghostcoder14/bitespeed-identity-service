import express from 'express';
import { PrismaClient } from '@prisma/client';
import { handleIdentify } from '../utils/contactUtils.js';

const prisma = new PrismaClient();
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const response = await handleIdentify(prisma, req.body);
    res.json({ contact: response });
  } catch (err) {
    console.error(' Error in /identify:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
