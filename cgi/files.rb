#!/usr/bin/ruby

require "cgi"
require 'json'

IGNORED = [ "sub", "idx", "srt", "nfo" ]

def isIgnored(s)
	IGNORED.include?(s.split(".")[-1])
end

def filterDir(f)
	return !f.end_with?("seen") && File.directory?(f) 
end

def filterFile(f)
	!isIgnored(f) && File.file?(f) 
end

def recode(f)
#f.force_encoding("ISO-8859-1").encode("UTF-8")
	f.to_s
end

def select(entries, path, callback)
	return entries.select {|f| callback.call(path + "/" + f) }.map{|f|recode(f)}.sort
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
	data["dirs"] = select(entries, path, method(:filterDir))
	data["files"] = select(entries, path, method(:filterFile))
end


puts JSON.generate(data)
