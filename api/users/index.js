import express from 'express';
import User from './userModel';
import jwt from 'jsonwebtoken';
import movieModel from '../movies/movieModel';
import personModel from '../people/personModel';

const router = express.Router(); // eslint-disable-line

// Get all users
router.get('/', (req, res, next) => {
  User.find().then(users => res.status(200).json(users)).catch(next);
});

// Register OR authenticate a user
router.post('/', async (req, res, next) => {
  if (!req.body.username || !req.body.password) {
    res.status(401).json({
      success: false,
      msg: 'Please pass username and password.',
    });
  }
  if (req.query.action === 'register') {
    await User.create(req.body).catch(next);
    res.status(201).json({
      code: 201,
      msg: 'Successful created new user.',
    });
  } else {
    const user = await User.findByUserName(req.body.username).catch(next);
    if (!user) return res.status(401).json({ code: 401, msg: 'Authentication failed. User not found.' });
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (isMatch && !err) {
        // if user is found and password is right create a token
        const token = jwt.sign(user.username, process.env.SECRET);
        // return the information including token as JSON
        res.status(200).json({
          success: true,
          token: 'BEARER ' + token,
        });
      } else {
        res.status(401).json({
          code: 401,
          msg: 'Authentication failed. Wrong password.'
        });
      }
    });
  }
});

// Update a user
router.put('/:id', (req, res, next) => {
  if (req.body._id) delete req.body._id;
  User.update({
    _id: req.params.id,
  }, req.body, {
    upsert: false,
  })
    .then(user => res.json(200, user)).catch(next);
});

//Favourties functionality
router.post('/:userName/favourites', async (req, res, next) => {
  const newFavourite = req.body.id;
  const userName = req.params.userName;
  const movie = await movieModel.findByMovieDBId(newFavourite);
  const user = await User.findByUserName(userName);
  await user.favourites.addToSet(movie._id);
  await user.save();
  res.status(201).json(movie).catch(next);
});

router.delete('/:userName/favourites', async (req, res, next) => {
  const newFavourite = req.body.id;
  const userName = req.params.userName;
  const movie = await movieModel.findByMovieDBId(newFavourite);
  const user = await User.findByUserName(userName);
  await user.favourites.splice(movie._id, 1);
  await user.save();
  res.status(201).json(user).catch(next);
});


router.get('/:userName/favourites', async (req, res, next) => {
  const userName = req.params.userName;
  await User.findByUserName(userName).then(
    user => res.status(200).send(user.favourites)
  ).catch(next);
  // res.status(201).send(user.favourites).catch(next);
});

//Watch List Functionallity
router.post('/:userName/watchList', async (req, res, next) => {
  const toWatch = req.body.id;
  const userName = req.params.userName;
  const movie = await movieModel.findByMovieDBId(toWatch);
  const user = await User.findByUserName(userName);
  await user.watchList.addToSet(movie._id);
  await user.save();

  res.status(201).json(user).catch(next);
});

router.delete('/:userName/watchList', async (req, res, next) => {
  const toWatch = req.body.id;
  const userName = req.params.userName;
  const movie = await movieModel.findByMovieDBId(toWatch);
  const user = await User.findByUserName(userName);
  await user.watchList.splice(movie._id, 1);
  await user.save();

  res.status(201).json(user).catch(next);
});


router.get('/:userName/watchList', (req, res, next) => {
  const userName = req.params.userName;
  User.findByUserName(userName).populate('watchList').then(
    user => res.status(201).json(user.watchList)
  ).catch(next);
});

//Following Functionallity
router.post('/:userName/following', async (req, res, next) => {
  const follow = req.body.id;
  const userName = req.params.userName;
  const person = await personModel.findByPersonDBId(follow);
  const user = await User.findByUserName(userName);
  await user.following.addToSet(person);
  await user.save();

  res.status(201).json(user).catch(next);
});

router.get('/:userName/following', async (req, res, next) => {
  const userName = req.params.userName;
  await User.findByUserName(userName).then(
    user => res.status(201).send(user.following)
  ).catch(next);
});




router.delete('/:userName/following', async (req, res, next) => {
  const follow = req.body.id;
  const userName = req.params.userName;
  const person = await personModel.find(follow);
  const user = await User.findByPersonDBId(userName);
  await user.following.splice(person._id, 1);
  await user.save();

  res.status(201).json(user).catch(next);

});

export default router;