const knex = require('../lib/knex')
const express = require('express')
const router = express.Router()

router.get('/', (req, res, next) => {
  knex('books')
  .select('id', 'title', 'author', 'genre', 'description', 'cover_url as coverUrl', 'created_at as createdAt', 'updated_at as updatedAt')
  .orderBy('title', 'ASC')
  .then(data => res.send(data))
  .catch(err => res.status(500).send(err))
})

router.get('/:id', (req, res, next) => {
  // make sure that id is a number,
  // if it is not a number, send a 400 (Bad Request)
  if (!req.params.id || Number.isNaN(req.params.id)) {
    throw new Error('Invalid ID')
  }

  getOne(req.params.id)
  .then((data) => {
    res.send(data)
  })
  .catch(err => {
    res.status(500).send(err)
  })
})

//Created a getBookInfo function to transform the book data to be used in multiple functions (Post & Update)
function getBookInfo (book){
  return {
    title: book.title,
    author: book.author,
    genre: book.genre,
    description: book.description,
    cover_url: book.coverUrl,
  }
}
router.post('/', (req, res, next) => {
  // Make sure that the information that you want is in the request body.
  knex('books')
    .insert(getBookInfo (req.body), '*')
    .then(([bookId]) => {
      res.send({bookId})
    })
    .catch(err => {
      next(err)
    })
})

function checkInput({id}) {
  if (!id || Number.isNaN(id)) {
    throw new Error('Invalid ID')
  }
  return id
}

function getOne(id) {
  return knex('books')
    .where('id', id)
    .first()
}

function update(book) {
  return knex('books')
    .update(getBookInfo (book), '*')
    .where('id', book.id)
}

router.put('/:id', (req, res, next) => {
  // Make sure that id is a number
  return Promise
  .resolve(checkInput(req.params))
  .then(getOne)
  .then(book => {
    if (!book || book.length === 0) {
      return res.status(404).send({message: 'Not found'})
    }
    return req.body
  })
  .then(update)
  .then(books => {
    if (!books) { return {message: 'nothing found for given id'} }
    const newObj = {
      id: books[0].id,
      title: books[0].title,
      author: books[0].author,
      genre: books[0].genre,
      description: books[0].description,
      coverUrl: books[0].cover_url,
    }
    res.send(newObj)
  })
  .catch(err => {
    next(err)
  })
})

router.delete('/:id', (req, res, next) => {
  let book = null

  if (!req.params.id || Number.isNaN(req.params.id)) {
    throw new Error('Invalid ID')
  }

  knex('books')
    .del()
    .where('id', req.params.id)
    .catch(err => res.status(500).send(err))
    .then(data => {
      res.status(200).send({deleted: data})
    })
})


module.exports = router
