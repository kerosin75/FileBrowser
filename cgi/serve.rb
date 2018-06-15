#!/usr/bin/ruby

require "cgi"
require 'json'
require 'digest/md5'

def log(msg, clear = false)
	m = "a"
	m = "w" if clear
	open('/tmp/serve.log', m) { |f| f.puts (msg) }
end


def done(msg, status, file = nil)
 	data = {}
	data["msg"] = msg;
	data["status"] = status;
	data["file"] = file if file
 	s = JSON.generate(data)
	log(s)
	puts s
	exit 0
end

def error(msg)
	done(msg, "error");
end

puts "Content-type: text/html\n\n";
cgi = CGI.new
path = cgi['path']

log(path, true)

error("Ungültiger Pfad") if path.include?("..") || !path.start_with?("/data")
error("Datei existiert nicht") unless File.file?(path)

md5 = Digest::MD5.hexdigest(path)
f="/var/www/apache/external/" + md5

if "true" == cgi['org']
	ende = ".org." + path.split(".")[-1]
	system("ln -s '" + path + "' " + f + ende)
	done("Fertig", "done", md5 + ende)
end

done("Fertig", "done", md5 + ".mp4") if File.file?(f + ".mp4")

done("Verarbeitungsfehler", "error") if File.file?(f + ".err")

done("Verarbeitung läuft", "running") if File.file?(f + ".run")

pid = spawn("/home/kerosin/bin/serveMovieApache \"" + path + "\" " + md5)
Process.detach(pid)

done("Gestartet", "running")
