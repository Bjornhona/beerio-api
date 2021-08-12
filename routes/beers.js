const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/user');

router.get('/', (req, res, next) => {
  axios.get('https://api.brewerydb.com/v2/beers/?hasLabels=Y&key=1ff4f5a771c204dd18912e145d2e13ac')
    .then((result) => res.json(result.data.data))
    .catch((error) => next(error));
})

router.get('/search/:type/:query', (req, res, next) => {
  const query = req.params.query;
  const type = req.params.type;

  axios.get(`https://api.brewerydb.com/v2/search?q=${query}&type=${type}&key=1ff4f5a771c204dd18912e145d2e13ac`)
    .then(result => {
      let response;
      if (type === "beer") {
        response = result.data.data && result.data.data.filter((item) => {
          return item.hasOwnProperty("labels");
        });
      } else {
        response = result.data.data && result.data.data;
      }
      return res.status(200).json(response);
    })
    .catch(error => next(error));
})

router.get('/favorites', (req, res, next) => {
  const userId = req.session.currentUser._id;

  User.findById(userId)
    .then((user) => {
      return res.status(200).json(user.favorites);
    })
    .catch((error) => next(error));
})

router.get('/breweries', (req, res, next) => {
  axios.get('https://api.brewerydb.com/v2/breweries/?withLocations=Y&isInBusiness=Y&key=1ff4f5a771c204dd18912e145d2e13ac')
  .then(result => {
    // const response = result.data.data;
    const response = result.data.data && result.data.data.filter((item) => {
      return item.hasOwnProperty("images");
    });
    return res.json(response);
  })
  .catch(next);
});

router.get('/styles', (req, res, next) => {
  axios.get(`https://api.brewerydb.com/v2/styles/?key=1ff4f5a771c204dd18912e145d2e13ac`)
  .then(result => {
    const response = result.data.data && result.data.data;
    return res.json(response);
  })
  .catch(next);
})

router.get('/glassware', (req, res, next) => {
  axios.get(`https://api.brewerydb.com/v2/glassware?key=1ff4f5a771c204dd18912e145d2e13ac`)
  .then(result => {
    const response = result.data.data && result.data.data;
    return res.json(response);
  })
  .catch(next);
})

router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  axios.get(`https://api.brewerydb.com/v2/beer/${id}?key=1ff4f5a771c204dd18912e145d2e13ac`)
    .then((result) => {
      const data = result.data.data;
      return res.status(200).json(data)
    })
    .catch((error) => {
      next(error);
    })
});

router.get('/brewery/:breweryId', (req, res, next) => {
  const breweryId = req.params.breweryId;
  axios.get(`https://api.brewerydb.com/v2/brewery/${breweryId}/?key=1ff4f5a771c204dd18912e145d2e13ac`)
  .then(result => {
    const data = result.data.data;
    return res.json(data);
  })
  .catch(next);
});

router.get('/brewery/:breweryId/locations', (req, res, next) => {
  const breweryId = req.params.breweryId;
  axios.get(`https://api.brewerydb.com/v2/brewery/${breweryId}/locations/?key=1ff4f5a771c204dd18912e145d2e13ac`)
  .then(result => {
    const data = result.data.data;
    return res.json(data);
  })
  .catch(next);
});

router.get('/locations/:zipCode', (req, res, next) => {
  const zipCode = req.params.zipCode;
  axios.get(`https://api.brewerydb.com/v2/locations/?zip-code=${zipCode}&key=1ff4f5a771c204dd18912e145d2e13ac`)
  .then(result => {
    const response = result.data.data;
    return res.json(response);
  })
  .catch(next);
});

router.put('/', (req, res, next) => {
  const { id, name, isOrganic, icon, style } = req.body;
  const userId = req.session.currentUser._id;

  User.findById(userId)
    .then((user) => {
      const fav = user.favorites.find(favorite => {
        return favorite.id === id;
      });
      const position = user.favorites.indexOf(fav);
      if (position < 0) {
        user.favorites.push({ id, name, isOrganic, icon, style });
      } else {
        user.favorites.splice(position, 1)
      }
      user.save()
      .then((user) => {
        res.status(200).json({ message: 'update' });
      })
      .catch(next)
    })
    .catch(next)
})

module.exports = router;