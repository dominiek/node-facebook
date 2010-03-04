
require.paths.unshift('spec', '/opt/local/lib/ruby/gems/1.8/gems/jspec-3.3.2/lib', 'lib')
require.paths.unshift('spec', 'lib', 'spec/lib')
require.paths.unshift(__dirname + '/../lib')
require.paths.unshift(__dirname + '/../lib/support')
require.paths.unshift(__dirname + '/../lib/support/express/lib')
require.paths.unshift(__dirname + '/../lib/support/hashlib/build/default')

require('jspec')
require("express")
require("express/spec")

print = puts
quit = process.exit

Express.environment = 'test'

JSpec
  .exec('./spec.plugins.facebook.js')
  .run({ reporter: JSpec.reporters.Terminal, fixturePath: 'spec/fixtures' })
  .report()
