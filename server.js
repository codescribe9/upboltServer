var express = require('express')
var cors = require('cors')
var multer = require('multer')
var bodyParser = require('body-parser');

var fs = require('fs')
var FileHandler = require('split-file')
var del = require('del')

// setup
const UPLOAD_PATH = 'uploads';



var storage = multer.diskStorage({
  destination: function (req, file, cb) {
  	
  	var dirName = file.originalname.split('.')[0];
  	var uploadPath = __dirname + '/uploads/' + dirName;
  	if(!fs.existsSync(uploadPath))
  		fs.mkdirSync(uploadPath);

    cb(null, uploadPath); 
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

//const upload = multer({ dest: `${UPLOAD_PATH}/` }); // multer configuration
const upload = multer({ storage: storage });


// app
const app = express();
app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.listen(9091, function () {
    console.log('listening on port 9091!');
});



app.post('/up', upload.single('file'), (req, res) => {
        
        //res.send({ id: data.$loki, fileName: data.filename, originalName: data.originalname });
        //res.sendStatus(400);
        //console.log('File uploaded' + req.file)
        res.sendStatus(200);
})



app.post('/merge', (req, res) => {
		
        var guid = req.body.guid;
        var fileName = req.body.fileName;
        var outputFilePath = 'uploads/' + fileName;
        var splitFilesFolderPath = 'uploads/' + guid;

        console.log(guid, fileName, outputFilePath);

		setTimeout(() => {      
	        fs.readdir(splitFilesFolderPath, (err, files) => {
	        	
	        	files = files.map((item, index) => {
	        		item = splitFilesFolderPath + '/' + item;
	        		return item;
	        	});
	        	//console.log(files);

	        	if(err) {
	        		console.log('ERROR!:', err)
	        		res.sendStatus(500)
	        	}
	        	else {
		        	FileHandler.mergeFiles(files, outputFilePath)
		        	.then(() => {
	        			del([splitFilesFolderPath]).then(paths => {
						    console.log('Deleted files and folders:\n', paths.join('\n'));
						});
		        		res.sendStatus(200)
		        	})
		        	.catch((err) => {
						console.log('ERROR1:', err)
		        		res.sendStatus(500)})
	        	}
	        })
    	}, 300);


        
})