import express from 'express';
import personModel from './personModel';

const router = express.Router();

router.get('/', (req, res, next) => {
    personModel.find().then(people => res.status(200).send(people)).catch(next);
});

router.get('/:id', (req, res, next) => {
  const id = parseInt(req.params.id);
  personModel.findByPersonDBId(id).
  then(person => res.status(200).send(person)).catch(next);
});

export default router;