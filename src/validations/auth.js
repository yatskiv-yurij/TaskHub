import { body } from 'express-validator';


export const loginValidation = [
    body('email', 'Невірний формат пошти').isEmail(),
    body('password', 'Пароль повинен бути не менше 5 символів').isLength({ min: 5 }),
];

export const registerValidation = [
    body('email', 'Невірний формат пошти').isEmail(),
    body('fullname', 'Вкажіть ім\'я').isLength({ min: 6 }),
];

export const updateValidation = [
    body('email', 'Невірний формат пошти').optional().isEmail(),
    body('password', 'Пароль повинен бути не менше 5 символів').optional().isLength({ min: 5 }),
    body('fullname', 'Вкажіть ім\'я').optional().isLength({ min: 6 }),
];
