// pull in our models. This will automatically load the index.js from that folder
const models = require('../models');

const Cat = models.Cat.CatModel;
const Dog = models.Dog.DogModel;

// default fake data so that we have something to work with until we make a real Cat
const defaultData = {
  name: 'unknown',
  bedsOwned: 0,
};

let lastCatAdded = new Cat(defaultData);
let lastDogAdded = new Dog({
  name: 'unknown dog',
  breed: 'unknown breed',
  age: 0,
});

const hostIndex = (req, res) => {
  res.render('index', {
    currentCatName: lastCatAdded.name,
    currentDogName: lastDogAdded.name,
    title: 'Home',
    pageName: 'Home Page',
  });
};

// deliver all cats to user
const readAllCats = (req, res, callback) => {
  Cat.find(callback).lean();
};

// deliver all dogs to the user
const readAllDogs = (req, res, callback) => {
  Dog.find(callback).lean();
};

const readAnimal = (req, res) => {
  const name1 = req.query.name;
  const callback = (err, doc) => {
    if (err) {
      return res.status(500).json({ err });
    }
    return res.json(doc);
  };
  if (req.query.animal && req.query.animal === 'cat') {
    Cat.findByName(name1, callback);
  } else {
    Dog.findByName(name1, callback);
  }
};

const hostPage1 = (req, res) => {
  const callback = (err, docs) => {
    if (err) {
      return res.status(500).json({ err });
    }
    return res.render('page1', { cats: docs });
  };

  readAllCats(req, res, callback);
};

const hostPage2 = (req, res) => {
  res.render('page2');
};

const hostPage3 = (req, res) => {
  res.render('page3');
};

const hostPage4 = (req, res) => {
  const callback = (err, docs) => {
    if (err) {
      return res.status(500).json({ err });
    }
    return res.render('page4', { dogs: docs });
  };

  readAllDogs(req, res, callback);
};

const getName = (req, res) => {
  // if cat
  if (req.query.animal && req.query.animal === 'cat') {
    res.json({ name: lastCatAdded.name });
  } else {
    res.json({ name: lastDogAdded.name });
  }
};

const setName = (req, res) => {
  // if cat
  if (req.body.animal && req.body.animal === 'cat') {
    if (!req.body.firstname || !req.body.lastname || !req.body.beds) {
      return res.status(400).json({ error: 'firstname,lastname and beds are all required' });
    }
    const name = `${req.body.firstname} ${req.body.lastname}`;
    const catData = {
      name: name,
      bedsOwned: req.body.beds,
    };

    const newCat = new Cat(catData);
    const savePromise = newCat.save();
    savePromise.then(() => {
      lastCatAdded = newCat;
      console.log(lastCatAdded);
      res.json({
        name: lastCatAdded.name,
        beds: lastCatAdded.bedsOwned,
      });
    });
    savePromise.catch((err) => {
      res.status(500).json({ err });
    });
  } else { // it dog
    if (!req.body.firstname || !req.body.lastname || !req.body.breed || !req.body.age) {
      return res.status(400).json({ error: 'firstname, lastname, breed and age are all required' });
    }
    const name = `${req.body.firstname} ${req.body.lastname}`;
    const dogData = {
      name: name,
      breed: req.body.breed,
      age: req.body.age,
    };

    const newDog = new Dog(dogData);
    const savePromise = newDog.save();
    savePromise.then(() => {
      lastDogAdded = newDog;
      res.json({
        name: lastDogAdded.name,
        breed: lastDogAdded.breed,
        age: lastDogAdded.age,
      });
    });
    savePromise.catch((err) => {
      res.status(500).json({ err });
    });
  }
  return res;
};

const searchName = (req, res) => {
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  // if cat
  return Cat.findByName(req.query.name, (err, doc) => {
    if (err) {
      return res.status(500).json({ err });
    }
    if (!doc) {
      return res.json({ error: 'No Cats Found 3:' });
    }

    return res.json({
      name: doc.name,
      beds: doc.bedsOwned,
    });
  });
};

const getDog = (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  return Dog.findByName(req.body.name, (err, doc) => {
    if (err) {
      return res.status(500).json({ err });
    }
    if (!doc) {
      return res.json({ error: 'No Dogs Found :(' });
    }

    const dogData = {
      name: doc.name,
      breed: doc.breed,
      age: doc.age,
      createdDate: doc.createdDate,
    };

    lastDogAdded = new Dog(dogData);
    lastDogAdded.age++;
    console.log(lastDogAdded);

    /*
    const deletePromise = lastDogAdded.delete();
    deletePromise.catch((error) => {
      res.status(500).json({ error });
    });
    */

    const savePromise = lastDogAdded.save();
    savePromise.then(() => {
      res.json({
        name: lastDogAdded.name,
        breed: lastDogAdded.breed,
        age: lastDogAdded.age,
      });
    });
    savePromise.catch((error) => {
      res.status(500).json({ error });
    });
    return res;
  });
};

const updateLast = (req, res) => {
  if (req.body.name !== 'unknown') {
    lastCatAdded.bedsOwned++;

    const savePromise = lastCatAdded.save();
    savePromise.then(() => {
      res.json({
        name: lastCatAdded.name,
        beds: lastCatAdded.bedsOwned,
      });
    });
    savePromise.catch((err) => {
      res.status(500).json({ err });
    });
  }
};

const notFound = (req, res) => {
  res.status(404).render('notFound', {
    page: req.url,
  });
};

module.exports = {
  index: hostIndex,
  page1: hostPage1,
  page2: hostPage2,
  page3: hostPage3,
  page4: hostPage4,
  readAnimal,
  getName,
  setName,
  updateLast,
  searchName,
  notFound,
  getDog,
};
