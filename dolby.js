const fs = require('fs');
const axios = require('axios').default;
var $ = require("jquery");
const APIKEY = 'aLoqEU72Rz9Th9tORbixy0iQRxIVJpAG';
const file_path = 'C:/Users/Cumtown/Documents/BRUH/server/';
const output_path = 'C:/Users/Cumtown/Documents/BRUH/server/';
module.exports = {
dl_res: null,
enhance_file: function(file_name) {
  let fpfn = file_path + file_name;
  console.log(fpfn);
  let media_input_config = {
    method: 'post',
    url: 'https://api.dolby.com/media/input',
    headers: {
      'x-api-key': APIKEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    data: {
      url: 'dlb://in/' + file_name
    }
  };
  axios(media_input_config).then((response) => {
    let upload_config = {
      method: 'put',
      url: response.data.url,
      data: fs.createReadStream(fpfn),
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': fs.statSync(fpfn).size
      }
    }
    axios(upload_config).then(function() {
      console.log("File uploaded!");
      return Promise.resolve(true);
    }).then().catch(function(error) {
      console.log(error);
    })
  }).then(function() {
    let split = file_name.split('.');
    let rname = split[0];
    let extension = split[1];
    let media_enhance_config = {
      method: 'post',
      url: 'https://api.dolby.com/media/enhance',
      headers: {
        'x-api-key': APIKEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      data: {
        input: 'dlb://in/' + file_name,
        output: 'dlb://out/' + rname + '-enhanced.' + extension
      }
    };
    axios(media_enhance_config)
      .then(function(response) {
        console.log(response.data.job_id);
        console.log("File enhanced!");
        setTimeout(()=>{},1000);
      }).then(function() {
        let media_get_config = {
          method: 'get',
          url: 'https://api.dolby.com/media/output',
          headers: {
            'x-api-key': APIKEY,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          responseType: 'stream',
          params: {
            url: 'dlb://out/' + rname + '-enhanced.' + extension
          }
        };
        let intId = setInterval(()=>{
        axios(media_get_config)
          .then(function (response) {
            response.data.pipe(fs.createWriteStream(output_path + rname + '-enhanced.' + extension));
            response.data.on('error', function(error) {
              console.log("error downloading, retrying...");
            });
            response.data.on('end', function() {
              console.log('File downloaded!');
              module.exports.dl_res = true;
              clearInterval(intId);
            })
            }).catch(function(error) {
            console.log("error downloading, retrying in 2 seconds...");
          });}, 2000)
      }).catch(function(error) {
        console.log(error);
      })
  })
}
}
