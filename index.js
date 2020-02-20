const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const app = express();

const storage = multer.diskStorage({
  destination: "public/uploads",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 1000000 }, // giới hạn dung lượng file tải lên
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single("file");

const uploads = multer({
  storage,
  limits: { fileSize: 1000000 },
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).array("files");

function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images Only!");
  }
}
app.set("view engine", "ejs");
app.set("views", "./views");

// app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use("/public", express.static("public"));
app.use(express.static(__dirname + "/public"));

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.render("index");
});

// Single
app.post("/upload", (req, res, next) => {
  upload(req, res, err => {
    if (err) {
      res.render("index", {
        msg: err
      });
    } else {
      if (req.file == undefined) {
        res.render("index", {
          msg: "Error: No File Selected!"
        });
      } else {
        res.render("index", {
          msg: "File Uploaded!",
          file: `<img src="uploads/${req.file.filename}"  class="responsive-img"/>`
        });
      }
    }
  });
});

//Multiple
app.post("/uploads", (req, res, next) => {
  uploads(req, res, err => {
    if (err) {
      res.render("index", {
        msg: err
      });
    } else {
      if (req.files == undefined) {
        res.render("index", {
          msg: "Error: No file selected"
        });
      } else {
        let fileInfo = req.files;
        let resultImg = fileInfo.map(
          img => `<img src="uploads/${img.filename}"  class="responsive-img"/>`
        );
        resultImg = resultImg.reduce((a, b) => a + b, "");
        res.render("index", { msg: "File Uploaded!", resultImg });
      }
    }
  });
});

app.listen(PORT, () => console.log(`App running ${PORT}`));
