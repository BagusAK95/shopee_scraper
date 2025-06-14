import { query } from 'express-validator';

// Validation rules for GET /shopee?shopId=178926468&itemId=21448123549
export const validateGetProduct = [
  query('shopId')
    .exists().withMessage('shopId is required')
    .isNumeric().withMessage('shopId must be a number'),
  query('itemId')
    .exists().withMessage('itemId is required')
    .isNumeric().withMessage('itemId must be a number')
];