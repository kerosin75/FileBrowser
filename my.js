if (!String.prototype.endsWith) {
	String.prototype.endsWith = function(suffix) {
				return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}

if (!String.prototype.startsWith) {
	  String.prototype.startsWith = function(searchString, position) {
			    position = position || 0;
					    return this.indexOf(searchString, position) === position;
							  };
}

if (!String.prototype.trim) {
	  String.prototype.trim = function () {
			    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
					  };
}

function getUrlParameter(name) {
	    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
			    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
					    var results = regex.exec(location.search);
							    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

String.prototype.trunc = String.prototype.trunc ||
      function(n){
				return (this.length > n) ? this.substr(0, n-1) + '...' : this;
			};

function createItem(p, label, depth) {
	var s = "<div class='divTableRow'>";
	s += "<div class='divTableCell item ";
	
	var isDir = p.endsWith("/");
	if (isDir)
			s += "dir";
	s += "' ";
	if (depth > 0)
		s+= "style='padding-left:" + (depth * 15) + "px'"; 

	var	l = label.trunc(40);
	if (l != label)
	{
		var fs = label.split(".");
		l += fs[fs.length -1];
	}
		
	s +=">" + l + "</div>";
	s += "<div class='divTableCell buttons'>";
	if (isDir)
		s += "<div class='material-icons btn' onclick=\"fetch('" + p + "')\"> arrow_forward</div>";
	else
	{
		s += "<div class='material-icons btn' onclick=\"serve('" + p + "','" + label + "')\">arrow_right</div>";
		s += "<div class='material-icons btn' onclick=\"serve('" + p + "','" + label + "',true)\">cloud</div>";
		s += "<div class='material-icons btn' onclick=\"play('" + p + "','" + label + "',true)\">tv</div>";
	}

	if (!label.match(/(data|german|movies|serien)/))
		s += "<div class='material-icons btn' onclick=\"searchWeb('"+label+"')\">search</div>";

	s += "</div></div>";
	$('#data').append(s);
}

function serve(path, label, org)
{
	path=encodeURI(path);
	label=encodeURI(label);
	window.open("serve.html?path=" + path + "&label=" + label + "&org=" + org);
}

function update(data)
{
	$("#data").empty();
	var path = data["path"]
	var ps = path.split("/");
	var t = "/";
	var p = "";
	for (var i = 1; i < ps.length; i++)
	{
		p = ps[i];
		t += p + "/";
		createItem(t, p, i);
	}

	var depth = ps.length - 1;
	var dirs= data["dirs"] || [];
	var files= data["files"] || [];
	
	for (var i = 0; i < dirs.length; i++)
	{
		var d = dirs[i];
		createItem(path + "/" + d + "/", d, ps.length);
	}

	for (var i = 0; i < files.length; i++)
	{
		var d = files[i];
		var s = path + "/" + d;
		var l = d;
		console.log(l, p);
		if (l.startsWith(p))
			l = l.substring(p.length);

		l = l.trim();

		if (l.startsWith("-"))
			l = l.substring(1).trim();

		createItem(s, l, ps.length);
	}
}

function fetch(path)
{
	path=encodeURI(path);
	console.log("fetch: " + path);
	$.ajax({
			  url: "cgi/files.rb?path=" + path,
				context: document.body,
				dataType: "json",
				}).done(update);
}

function fetchServeState()
{
	var path = getUrlParameter("path");
	var org = getUrlParameter("org");
	path=encodeURI(path);
	$.ajax({
			  url: "cgi/serve.rb?path=" + path + "&org=" + org,
				context: document.body,
				dataType: "json",
				}).done(updateServeState);
}

function play(path)
{
	// leider kein zugriff auf file möglich von JS
	if (false && path.indexOf("cloud:") != null)
	{
		path = path.replace("/data/", "file:///z:/");
		window.open(path);
		return;
	}

	path=encodeURI(path);
	$.ajax({
			  url: "cgi/play.rb?path=" + path,
				context: document.body,
				dataType: "json",
				});
}


var animState = false;
function updateServeState(data)
{
	var status = data["status"];

	if (status == "done" || status == "error")
	{
		clearTimeout(timer);
		$("#busy").hide();
		if (status ==  "done")
		{
			$("#result").show();
			$("#status").hide();
			html = "<a href='external/" + data["file"] + "'><img src='movie.png' width='250px' /></a>"
			html += "<p/>"
			html += "<a href='http://" + privateURL + "/" + data["file"] + "'><img src='movieExt.png' width='250px' /></a>"
			$("#result").html(html);
		}
	}
	else
	{
		// $("#busy").show();
		var msg = data["msg"];
		var oldmsg = $("#status").text();
		if (oldmsg.startsWith(msg))
			msg = oldmsg + ".";
		$("#status").text(msg);
	}

}

function searchWeb(label, path)
{
	label = label.toLowerCase();
	label = label.replace(/(german|720p|1080p|ac3|bdrip|[(]|xvid|mkv|avi|dts|extended|proper|dvd|mp4|bdrip|brrip|blueray|264|multi|webrip).*/g, ""); 
	label = label.replace(/[.]/g, " ");
	label = label.trim();
	label = encodeURI(label);
	var url =  "https://www.imdb.com/find?ref_=nv_sr_fn&q=" + label + "&s=tt";
	window.open(url, '_blank');
}


var timer;
function showServe()
{
	var path = getUrlParameter("path");
	var label = getUrlParameter("label");
	label = label.trunc(35);

	$("#filename").text(label);
	fetchServeState();
	timer = setInterval(fetchServeState, 5000);
}

