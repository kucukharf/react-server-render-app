require('babel-core/register')({
    presets: ['es2015', 'react']
})

var request = require('request');


//default info, Please use your own API key!!
var apiKey = '&key=AIzaSyCxrc0vDQf7b6IuLxph310QZFsh8tSnpc0',
	apiURL = 'https://www.googleapis.com/youtube/v3/search?';
var apiDefaultParams = 'part=snippet&maxResults=5&type=video&fields=items(id(videoId)%2Csnippet(title%2C+thumbnails(medium(url))))&q='
//my selected artists
var options = ['The Album Leaf', 'Deerhunter', 'Jason Mraz' ,'Boards of Canada', 'Mogwai', 'React Europe'];

//create a map for the use for query 
var queryMap = {};

//this is used to change the options into query style used by the Youtube API
var getQueryWord = function(str) {
	var words = str.split(' ');
	var queryWord = '';
	words.map(function(word, i) {
		if (i != 0) {
			queryWord += '+' + word.toLowerCase(word); 
		} else {
			queryWord += word.toLowerCase(word);
		}
	});

	return queryWord;
};

options.map(function(option) {
	queryMap[option] = getQueryWord(option);
});

//function to return a variable API url
var getURL = function(option) {
	return apiURL + apiDefaultParams + queryMap[option] + apiKey;
}

//parse the result get from the API to the proper form used by our React element
var parseResult = function(result) {
	var retArray = [];
	result.map(function(item) {
		var videoId = item.id.videoId;
		var videoTitle = item.snippet.title;
		var imgURL = item.snippet.thumbnails.medium.url;

		retArray.push({
			key: videoId,
			data: {
				videoTitle: videoTitle,
				imgURL: imgURL
			}
		})
	});
	return retArray;
}



require('babel-core/register');
var express = require('express')
  , app = express()
  , React = require('react')
  , ReactDOMServer = require('react-dom/server')
  , components = require('./app/Main.js')

var MyApp = React.createFactory(components.MyApp)

app.engine('jade', require('jade').__express)
app.set('view engine', 'jade')

app.use(express.static(__dirname + '/public'))

//INITIAL SETUP
//server side call the initial props
request(getURL(options[0]), function (error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log("success call"); // Print the google web page.
        var initData = parseResult(JSON.parse(body).items);
        // console.log(JSON.parse(body).items);

		var initProps = {
		    options: options, 
			selected: options[0],
			listData: initData
		}
		app.get('/', function(req, res){
		  res.render('index', {
		    react: ReactDOMServer.renderToString(MyApp({initProps: initProps})),
		    //serialise the props to JSON so they can be included as a variable in the initial HTML sent to the client:
		    props: JSON.stringify(initProps)
		  })
		})
        // console.log(myResult);
     } else {
     	console.log("fail call")
     }
});


//set up RESTful api for options change call
options.map(function(option, index) {
	app.get(encodeURI('/'+option), function(req, res){
	  	//testing
		request(getURL(option), function (error, response, body) {
		    if (!error && response.statusCode == 200) {
		        console.log("success call"); // Print the google web page.
		        var myResult = parseResult(JSON.parse(body).items);
		        // console.log(JSON.parse(body).items);
	  			res.send(JSON.stringify(myResult));
		        // console.log(myResult);
		     } else {
		     	console.log("fail call")
		     }
		});
	});
});
/*
Important: 
React will check that any initial markup present matches what's produced for the first render on the client 
by comparing checksums between the initial client render and a checksum attribute in the server-rendered markup, 
so I must make the same props available for the initial render on the client in order to reuse the markup.
*/


app.listen(3000, function() {
  console.log('Listening on port 3000...')
})