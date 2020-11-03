vcl 4.0;

# This is where your content lives. Adjust it to point at your web server.
backend nginx {
	.host = "nginx";
	.port = "80";
}

# The only thing stopping Varnish from caching properly by default in most
# cases is the presence of cookies. Strip them, and voila, cache works.
sub vcl_recv {
	unset req.http.cookie;
}

# That's all you need, but you might want to start adjusting cache duration
# too! You can do that by emitting "Cache-Control: s-maxage=123" from your
# backend server, telling Varnish to cache for 123 seconds. That requires 0
# configuration, but the following snippet removes "s-maxage" from the
# response before it is sent to the client, so as not to confuse other
# proxy servers between you and the client.
sub strip_smaxage {
	# Remove white space
	set beresp.http.cache-control = regsuball(beresp.http.cache-control, " ","");
	# strip s-maxage - Varnish has already used it
	set beresp.http.cache-control = regsub(beresp.http.cache-control, "s-maxage=[0-9]+\b","");
	# Strip extra commas
	set beresp.http.cache-control = regsub(beresp.http.cache-control, "(^,|,$|,,)", "");
}

# This just calls the above function at the appropriate time.
sub vcl_backend_response {
	call strip_smaxage;
}

# You can read more about control Varnish through headers at 
# https://varnishfoo.info/chapter-2.html