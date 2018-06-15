#!/usr/bin/ruby

require "cgi"

def error(msg)
	done(msg, "error");
end

puts "Content-type: text/html\n\n";
cgi = CGI.new
path = cgi['path']

system("/home/kerosin/bin/playMovie '" + path + "'")
