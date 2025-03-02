import multer from "multer";

const storage = multer.memoryStorage({
    destination: function (req, file, cb) {
      cb(null,"./public/temp")
    },
    fileFilter: (req, file, cb) => {
      const videoMimeTypes = [
          'video/mp4',       // .mp4
          'video/x-mpegurl',  // .m3u8
          'video/quicktime',  // .mov
          'video/waveform',   // .webm
          'video/x-msvideo'    // .avi, .asf
      ];
      if (videoMimeTypes.includes(file.mimetype)) {
        return cb(new Error('Video files are not allowed!'));
    }
    cb(null, true);
  },
  limits: { fileSize: '200mb' },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ storage })