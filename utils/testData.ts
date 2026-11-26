import { readFileSync } from 'fs';

export const products = JSON.parse(readFileSync('test-data/products.json', 'utf-8'));