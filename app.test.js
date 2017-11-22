const test      = require('ava')
const makeApp   = require('./app')
const knex      = require('./lib/knex')
const supertest = require('supertest')

let bookId = 1

test.before('guaranteed cleanup', t => {
  return knex('books')
    .del()
})

test.after.always('guaranteed cleanup', t => {
  return knex('books')
    .del()
})

test('GET:    /books (no results)', t => {
	return supertest(makeApp(false))
		.get('/books')
    .then(res => {
      // console.log('RES', Object.keys(res).sort())
      t.is(res.status, 200)
      t.truthy(res.body.length === 0)
      return res
    })
});

test('POST:   /books (create 1 record)', t => {
	return supertest(makeApp(false))
		.post('/books')
    .send({title: 'Prototypes', author: 'Kyle Simpson', genre: 'Jedi Dev', description: 'This & that'})
    .then(res => {
      // console.log('RES', Object.keys(res).sort())
      t.is(res.status, 200)
      t.truthy(res.body.bookId)

      bookId = res.body.bookId

      return res
    })
})


test('GET:    /books (1 result)', t => {
	return supertest(makeApp(false))
		.get('/books')
    .then(res => {
      // console.log('RES', Object.keys(res).sort())
      t.is(res.status, 200)
      t.truthy(res.body.length === 1)
      return res
    })
});

test(`GET:    /books/${bookId} (1 result)`, t => {
	return supertest(makeApp(false))
		.get(`/books/${bookId}`)
    .then(res => {
      // console.log('RES', Object.keys(res).sort())
      t.is(res.status, 200)
      t.truthy(res.body.title.length >= 1)
      return res
    })
});

test(`DELETE: /books/${bookId} (1 result)`, t => {
	return supertest(makeApp(false))
		.delete(`/books/${bookId}`)
    .then(res => {
      // console.log('RES', Object.keys(res).sort())
      t.is(res.status, 200)
      return res
    })
});
