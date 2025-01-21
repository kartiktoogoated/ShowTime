// const multer = require('multer');
// const path = require('path');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, './uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     const filetypes = /jpeg|jpg|png|gif/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = filetypes.test(file.mimetype);
//     if (mimetype && extname) {
//       return cb(null, true);
//     }
//     cb(new Error('Only image files are allowed!'));
//   },
// });

// router.post('/add', authorizeAdmin, 
//   upload.none(), async (req, res) => {
//   try {
//     console.log(req.body)
//     const { title, description, genre } = req.body;
    
//     const posterImage = req.file.path; 
//     const newMovie = new Movie({
//       title,
//       description,
//       genre,
//     });
//     await newMovie.save();
//     res.status(201).json({ message: 'Movie added successfully', movie: newMovie });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
