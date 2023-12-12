let model;
let classes;
let detectedLabel = "";

let video = null;

function detectFrame() {
  const tfimg = tf.browser.fromPixels(video.elt, 3);
  const cast = tfimg.cast('float32');
  const reshaped = cast.reshape([1, tfimg.shape[0], tfimg.shape[1], tfimg.shape[2]]);
  const prediction = model.predict(reshaped);
  const classScorePromise = prediction.data();
  
  classScorePromise.then(classScore => {
    const maxScoreId = classScore.indexOf(Math.max(...classScore));
    detectedLabel = classes[maxScoreId]
    tf.dispose([tfimg, cast, reshaped, prediction])      
  })
}


function setup() {
  createCanvas(400, 400);
  
  const base_url = "https://raw.githubusercontent.com/martingasser/tfjs-react/main/public/tfjs/catdog/"
  
  //const base_url = "https://teachablemachine.withgoogle.com/models/prZyCJ6n6/"
  const model_url = base_url + "model.json"
  const modelPromise = tf.loadGraphModel(model_url);

  const classes_url = base_url + "classes.json"
  
  const classesPromise = fetch(classes_url).
    then(response => { return response.json() });
    
  Promise.all([modelPromise, classesPromise]).then(v => {
    model = v[0]
    classes = Object.keys(v[1])

    
    const options = {
      video: {
        facingMode: {
          //exact: 'environment'
        }
      }
    }
    
    video = createCapture(options, () => {
      setInterval(() => {
        detectFrame();
      }, 100)
    });
    
    video.hide();
  })
  
}

function draw() {
  background(220);
  
  background(0);
  
  if (video) {
    image(video, 0, 0, width, width * video.height / video.width);
    
    fill(255);
    textSize(25);
    textAlign(CENTER);
    text(detectedLabel, width / 2, height - 30);    
  }
  
}