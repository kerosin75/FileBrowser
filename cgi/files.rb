#!/usr/bin/ruby

require "cgi"
require 'json'

IGNORED = [ "sub", "idx", "srt", "nfo" ]

def isIgnored(s)
	return IGNORED.include?(s.split(".")[-1])
end

puts "Content-type: text/html\n\n";
cgi = CGI.new
path = cgi['path']
path = "/data" unless path and path != ""

path = path.chomp("/")

exit if path.include?("..")
exit if !path.start_with?("/data")

data =  { }
data["path"] = path

if path == "/data"
	data["dirs"] = [ "german", "movies", "serien"]
else
	entries = Dir.entries(path).select {|f| !f.start_with?(".")}
	data["dirs"] = entries.select {|f| File.directory?(path + "/" + f) }.sort
	data["files"] = entries.select {|f| File.file?(path + "/" + f) && !isIgnored(f) }.sort
end


puts JSON.generate(data)
