const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
var busboy = require('connect-busboy');
const morgan = require('morgan');
const _ = require('lodash');
const path = require('path');
const app = express();
const ejs = require('ejs');
const dolby = require('./dolby');
const genrerec = require('./genrerec');
// enable files upload
app.use(fileUpload({
    createParentPath: true
}));

//add other middleware

app.use(cors());
app.use(bodyParser.json());
app.use(busboy());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/upload-clip', async (req, res) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            //Use the name of the input field (i.e. "avatar") to retrieve the uploaded file
            let clip = req.files.clip;
            console.log(clip);
            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            clip.mv('./uploads/' + clip.name);
			dolby.enhance_file('uploads/'+ clip.name);
			let split = clip.name.split('.');
			let intId = setInterval(()=>{
				console.log("Result:"+dolby.dl_res);
				if(dolby.dl_res != null){
					genrerec.identify_song('./uploads/'+split[0]+'-enhanced.'+split[1]);
				//send response
          let bintId = setInterval(()=>{
            console.log("grecRes:"+genrerec.song_data);
            if(genrerec.song_data != null){
              res.render('processed', {songname: 'f', songartist:'f', songgenre:JSON.stringify(genrerec.song_data['genres'][0]['name']).replace(new RegExp('"', 'g'),'')});
              clearInterval(bintId);
            }
          }, 1000)
					clearInterval(intId);
				}
			}, 5000);

        }
    } catch (err) {
		console.log(err);
        res.status(500).send(err);
    }
});



//start app
const port = process.env.PORT || 80;

app.listen(port, () =>
  console.log(`App is listening on port ${port}.`)
);
