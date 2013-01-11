var assert = require('assert');

var helpers = {
    assertStatus: function (code) {
        return function (res) {
            assert.equal(res.statusCode, code);
        };
    },
    
    assertDefaultHeaders: function () {
        return function (res) {
            assert.equal(res.headers['server'], 'Blaster 0.1a');
            assert.equal(res.headers['content-type'], 'text/html; charset=UTF-8');
        }
    },
    
    assertNotSetCookie: function () {
        return function (res) {
            assert.isUndefined(res.headers['set-cookie']);
        }        
    }
};

exports.helpers = helpers;