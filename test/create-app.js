var assert = require('chai').assert
var supertest = require('supertest')
var nock = require('nock')
var async = require('async')
// Helper functions for the FS
var rm = require('./test-utils').rm
var write = require('./test-utils').write
var cp = require('./test-utils').cp
var read = require('./test-utils').read

var solid = require('../index')

describe('solid params', function () {

  describe('proxy', function () {

    var ldp = solid({
      root: __dirname + '/resources',
      proxy: '/proxy'
    })
    var server = supertest(ldp)

    it('should return the website in /proxy?uri', function (done) {
      nock('https://amazingwebsite.tld').get('/').reply(200)
      server.get('/proxy?uri=https://amazingwebsite.tld/')
        .expect(200, done)
    })

    it('should also work on /proxy/ ?uri', function (done) {
      nock('https://amazingwebsite.tld').get('/').reply(200)
      server.get('/proxy/?uri=https://amazingwebsite.tld/')
        .expect(200, done)
    })

    it('should return the same HTTP status code as the uri', function (done) {
      async.parallel([
        // 500
        function (next) {
          nock('https://amazingwebsite.tld').get('/404').reply(404)
          server.get('/proxy/?uri=https://amazingwebsite.tld/404')
            .expect(404, next)
        },
        function (next) {
          nock('https://amazingwebsite.tld').get('/401').reply(401)
          server.get('/proxy/?uri=https://amazingwebsite.tld/401')
            .expect(401, next)
        },
        function (next) {
          nock('https://amazingwebsite.tld').get('/500').reply(500)
          server.get('/proxy/?uri=https://amazingwebsite.tld/500')
            .expect(500, next)
        },
        function (next) {
          nock('https://amazingwebsite.tld').get('/').reply(200)
          server.get('/proxy/?uri=https://amazingwebsite.tld/')
            .expect(200, next)
        }
      ], done)
    })

    it('should work with cors', function (done) {
      nock('https://amazingwebsite.tld').get('/').reply(200)
      server.get('/proxy/?uri=https://amazingwebsite.tld/')
        .set('Origin', 'http://example.com')
        .expect('Access-Control-Allow-Origin', 'http://example.com')
        .expect(200, done)
    })
  })


  describe('suffixMeta', function () {
    describe('not passed', function () {
      it('should fallback on .meta', function () {
        var ldp = solid()
        assert.equal(ldp.locals.solid.suffixMeta, '.meta')
      })
    })
  })

  describe('suffixAcl', function () {
    describe('not passed', function () {
      it('should fallback on .acl', function () {
        var ldp = solid()
        assert.equal(ldp.locals.solid.suffixAcl, '.acl')
      })
    })
  })

  // TODO this should be in create-server
  // describe('mount', function () {

  //   describe('not passed', function () {
  //     it('should fallback on /', function (done) {
  //       var ldp = solid()
  //       assert.equal(ldp.locals.solid.mount, '/')
  //       done()
  //     })

  //   })

  //   describe('passed', function () {
  //     it ('should properly set the opts.mount', function (done) {
  //       var ldp1 = solid({
  //         mount: '/'
  //       })
  //       assert.equal(ldp1.locals.solid.mount, '/')

  //       var ldp2 = solid({
  //         mount: '/test'
  //       })
  //       assert.equal(ldp2.locals.solid.mount, '/test')

  //       done()
  //     })
  //     it('should drop tha trailing /', function () {
  //       var ldp1 = solid({
  //         mount: '/test/'
  //       })
  //       assert.equal(ldp1.locals.solid.mount, '/test')

  //       var ldp2 = solid({
  //         mount: '/test/test'
  //       })
  //       assert.equal(ldp1.locals.solid.mount, '/test')
  //     })
  //   })
  // })

  describe('root', function () {
    describe('not passed', function () {
      var ldp = solid()
      var server = supertest(ldp)

      it ('should fallback on current working directory', function () {
        assert.equal(ldp.locals.solid.root, process.cwd() + '/')
      })

      it ('should find resource in correct path', function (done) {
        write(
          '<#current> <#temp> 123 .',
          'sampleContainer/example.ttl')

        // This assums npm test is run from the folder that contains package.js
        server.get('/test/resources/sampleContainer/example1.ttl')
          .set('Accept', 'text/turtle')
          .expect(200)
          .expect('Link', /http:\/\/www.w3.org\/ns\/ldp#Resource/)
          .end(function (err, res, body) {
            assert.equal(read('sampleContainer/example.ttl'), '<#current> <#temp> 123 .')
            rm('sampleContainer/example.ttl')
            done(err)
          })
      })
    })

    describe('passed', function () {
      var ldp = solid({root: './test/resources/'})
      var server = supertest(ldp)

      it ('should fallback on current working directory', function () {
        assert.equal(ldp.locals.solid.root, './test/resources/')
      })

      it ('should find resource in correct path', function (done) {
        write(
          '<#current> <#temp> 123 .',
          'sampleContainer/example.ttl')

        // This assums npm test is run from the folder that contains package.js
        server.get('/sampleContainer/example.ttl')
          .set('Accept', 'text/turtle')
          .expect('Link', /http:\/\/www.w3.org\/ns\/ldp#Resource/)
          .expect(200)
          .end(function (err, res, body) {
            assert.equal(read('sampleContainer/example.ttl'), '<#current> <#temp> 123 .')
            rm('sampleContainer/example.ttl')
            done(err)
          })
      })
    })
  })
})
