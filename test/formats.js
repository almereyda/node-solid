var supertest = require('supertest')
var solid = require('../index')

describe('formats', function () {
  var ldp = solid.createServer({
    root: __dirname + '/resources'
  })

  var server = supertest(ldp)
  describe('HTML', function () {
    it('Should return HTML containing "Hello, World!" if Accept is set to text/html', function (done) {
      server.get('/sampleContainer/hello.html')
        .set('accept', 'application/xml,application/xhtml+xml,text/html;q=0.9,text/plain;q=0.8,image/png,*/*;q=0.5')
        .expect('Content-type', /text\/html/)
        .expect(/Hello, world!/)
        .expect(200, done)
    })
  })

  describe('JSON-LD', function () {
    function isValidJSON (res) {
      var json = JSON.parse(res.text)
    }

    it('Should return JSON-LD document if Accept is set to application/ld+json', function (done) {
      server.get('/sampleContainer/example1.ttl')
        .set('accept', 'application/ld+json;q=0.9,text/turtle;q=0.8,text/plain;q=0.7,*/*;q=0.5')
        .expect('content-type', /application\/ld\+json/)
        .expect(200, done)
    })
    it('Should return valid JSON if Accept is set to JSON-LD', function (done) {
      server.get('/sampleContainer/example1.ttl')
        .set('accept', 'application/ld+json;q=0.9,text/turtle;q=0.8,text/plain;q=0.7,*/*;q=0.5')
        .expect(isValidJSON)
        .expect(200, done)
    })
  })

  describe('N-Quads', function () {
    it.skip('Should return N-Quads document is Accept is set to application/n-quads', function (done) {
      server.get('/sampleContainer/example1.ttl')
        .set('accept', 'application/n-quads;q=0.9,text/turtle;q=0.8,text/plain;q=0.7,*/*;q=0.5')
        .expect('content-type', /application\/n-quads/)
        .expect(200, done)
    })
  })

  describe('n3', function () {
    it('Should return turtle document if Accept is set to text/n3', function (done) {
      server.get('/sampleContainer/example1.ttl')
        .set('accept', 'text/n3;q=0.9,text/turtle;q=0.8,text/plain;q=0.7,*/*;q=0.5')
        .expect('content-type', /text\/n3/)
        .expect(200, done)
    })
  })

  describe('none', function () {
    it('Should return turtle document if no Accept header is set', function (done) {
      server.get('/sampleContainer/example1.ttl')
        .expect('content-type', /text\/turtle/)
        .expect(200, done)
    })
  })
})
