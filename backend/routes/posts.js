const express = require("express");
const multer = require("multer");
const Post = require("../models/post");
const router = express.Router();
const MIME_TYPE_MAP ={
  'image/png' : 'png',
  'image/jpeg' : 'jpg',
  'image/jpg' : 'jpg'
}
const storage = multer.diskStorage({
  destination: (req,file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid Mimie Type');
    if(isValid){
      error = null;
    }
    cb(null,"backend/images")
  },
  filename:(req,file,cb) =>{
    const name = file.originalname.toLowerCase().split(' ').join('-');
    const ext = MIME_TYPE_MAP[file.mimetype];
    cb(null, name+'-'+ Date.now() + '.' + ext);
  }
});
router.post("",multer({storage:storage}).single("image"), (req, res, next) => {
  const url = req.protocol + '://' + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath : url + "/images/" + req.file.filename
  });
  post.save().then(results => {
    res.status(201).json({
      message: "Post added!",
      post : {
          ...results,
        id : results._id,

      }
    });
  });
});

router.get("", (req, res, next) => {
  Post.find()
    .then(documents => {
      res.status(200).json({
        message: "Post fetched Successfully",
        posts: documents
      });
    })
    .catch(() => {
      console.log("error");
    });
});

router.delete("/:id", (req, res, next) => {
  Post.deleteOne({ _id: req.params.id }).then(results => {
    res.status(200).json("deleted");
  });
});

router.put("/:id",multer({storage:storage}).single("image") ,(req, res, next) => {
  let imagePath = req.body.imagePath;
  if(req.file){
    const url = req.protocol + '://' + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath
  });

  console.log(post);
  Post.updateOne({ _id: req.params.id }, post).then(results => {
    res.status(200).json({ message: "Updated Successfully!!" });
  });
});

router.get("/:id", (req, res, next) => {
  Post.findOne({ _id: req.params.id }).then(results => {
    if (results) {
      res.status(200).json(results);
    } else {
      res.status(200).json({ message: "Post Not Found!" });
    }
  });
});

module.exports = router;
