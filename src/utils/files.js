import multer from "multer";
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        const uniqueFileName = uuidv4();
        const fileExtension = file.originalname.split('.').pop();
        const finalFileName = `${uniqueFileName}.${fileExtension}`;
        cb(null, finalFileName);
    },
});

export const saveFiles = (req, res) => {
    try {
        let file_path;
        for(let key of req.files){
            file_path = `\\${key.path}`;
        }
        
        return res.status(200).json(file_path);
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Не вдалося зберегти картинки товару',
        });
    }
};

export const deleteFiles = (req, res) => {
    try {
        
        const files = [req.query.files];
        files?.forEach(path => fs.unlinkSync("." + path));
        res.json({
            success: true,
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: 'Картинки товару не були видалені',
        });
    }
}

export const downloadFile = (req, res) => {
    try {
        const file = req.body.file;

        res.download(file, (err) => {
            if (err) {
              console.error('Error downloading file:', err);
              res.status(500).send('Internal Server Error');
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: 'Файл завантажити не вдалось',
        });
    }
}