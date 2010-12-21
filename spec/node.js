
require.paths.unshift('/home/francois/.gem/ruby/1.8/gems/jspec-4.3.3/lib')
require.paths.unshift(__dirname + '/../lib')

var JSPEC = require('jspec');
var express = require("express")

print = require('sys').puts
quit = process.exit

//Express.environment = 'test'

JSpec
  .exec(__dirname +'/spec.plugins.facebook.js')
  .run({ reporter: JSpec.reporters.Terminal, fixturePath: 'spec/fixtures' })
  .report()
