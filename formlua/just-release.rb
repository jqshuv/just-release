# Copyright (c) 2024 Joshua Schmitt
#
# This software is released under the MIT License.
# https://opensource.org/licenses/MIT

require 'language/node'

class JustRelease < Formula
  desc 'A CLI tool for releasing npm packages'
  homepage 'https://github.com/jqshuv/just-release'
  url 'https://registry.npmjs.org/just-release/-/just-release-1.0.0.tgz'
  sha256 'b1b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3b3'
  license 'MIT'

  livecheck do
    url 'https://registry.npmjs.org/just-release/latest'
    regex(/"version":\s*"([^"]+)"/i)
  end

  depends_on 'node'

  def install
    system 'npm', 'install', *Language::Node.local_npm_install_args
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    system "#{bin}/just-release", '--version'
  end
end
