import { describe, it, expect } from 'vitest';
import { createDeviceModel, ValidationError, type IDeviceModel } from './device.js';

describe('createDeviceModel', () => {
    it('should create a device with valid inputs', () => {
        const input = {
            id: 'device-123',
            brand: 'Apple',
            model: 'MacBook Pro',
            category: 'Laptop',
            totalQuantity: 10,
        };

        const device = createDeviceModel(input);

        expect(device.id).toBe('device-123');
        expect(device.brand).toBe('Apple');
        expect(device.model).toBe('MacBook Pro');
        expect(device.category).toBe('Laptop');
        expect(device.totalQuantity).toBe(10);
        expect(device.createdAt).toBeInstanceOf(Date);
    });

    it('should trim whitespace from string fields', () => {
        const input = {
            id: '  device-123  ',
            brand: '  Apple  ',
            model: '  MacBook Pro  ',
            category: '  Laptop  ',
            totalQuantity: 5,
        };

        const device = createDeviceModel(input);

        expect(device.id).toBe('device-123');
        expect(device.brand).toBe('Apple');
        expect(device.model).toBe('MacBook Pro');
        expect(device.category).toBe('Laptop');
    });

    it('should accept zero total quantity', () => {
        const input = {
            id: 'device-123',
            brand: 'Apple',
            model: 'MacBook Pro',
            category: 'Laptop',
            totalQuantity: 0,
        };

        const device = createDeviceModel(input);

        expect(device.totalQuantity).toBe(0);
    });

    it('should throw error if id is missing', () => {
        const input = {
            id: '',
            brand: 'Apple',
            model: 'MacBook Pro',
            category: 'Laptop',
            totalQuantity: 10,
        };

        expect(() => createDeviceModel(input)).toThrow(ValidationError);
        expect(() => createDeviceModel(input)).toThrow('Field "id" is required');
    });

    it('should throw error if id is only whitespace', () => {
        const input = {
            id: '   ',
            brand: 'Apple',
            model: 'MacBook Pro',
            category: 'Laptop',
            totalQuantity: 10,
        };

        expect(() => createDeviceModel(input)).toThrow(ValidationError);
    });

    it('should throw error if brand is missing', () => {
        const input = {
            id: 'device-123',
            brand: '',
            model: 'MacBook Pro',
            category: 'Laptop',
            totalQuantity: 10,
        };

        expect(() => createDeviceModel(input)).toThrow(ValidationError);
        expect(() => createDeviceModel(input)).toThrow('Field "brand" is required');
    });

    it('should throw error if model is missing', () => {
        const input = {
            id: 'device-123',
            brand: 'Apple',
            model: '',
            category: 'Laptop',
            totalQuantity: 10,
        };

        expect(() => createDeviceModel(input)).toThrow(ValidationError);
        expect(() => createDeviceModel(input)).toThrow('Field "model" is required');
    });

    it('should throw error if category is missing', () => {
        const input = {
            id: 'device-123',
            brand: 'Apple',
            model: 'MacBook Pro',
            category: '',
            totalQuantity: 10,
        };

        expect(() => createDeviceModel(input)).toThrow(ValidationError);
        expect(() => createDeviceModel(input)).toThrow('Field "category" is required');
    });

    it('should throw error if totalQuantity is negative', () => {
        const input = {
            id: 'device-123',
            brand: 'Apple',
            model: 'MacBook Pro',
            category: 'Laptop',
            totalQuantity: -1,
        };

        expect(() => createDeviceModel(input)).toThrow(ValidationError);
        expect(() => createDeviceModel(input)).toThrow('totalQuantity');
    });

    it('should throw error if totalQuantity is not an integer', () => {
        const input = {
            id: 'device-123',
            brand: 'Apple',
            model: 'MacBook Pro',
            category: 'Laptop',
            totalQuantity: 5.5,
        };

        expect(() => createDeviceModel(input)).toThrow(ValidationError);
        expect(() => createDeviceModel(input)).toThrow('totalQuantity');
    });

    it('should throw error if input is null', () => {
        expect(() => createDeviceModel(null)).toThrow(ValidationError);
        expect(() => createDeviceModel(null)).toThrow('Input must be a non-null object');
    });

    it('should throw error if input is not an object', () => {
        expect(() => createDeviceModel('not an object')).toThrow(ValidationError);
        expect(() => createDeviceModel('not an object')).toThrow('Input must be a non-null object');
    });

    it('should throw error if id is not a string', () => {
        const input = {
            id: 123,
            brand: 'Apple',
            model: 'MacBook Pro',
            category: 'Laptop',
            totalQuantity: 10,
        };

        expect(() => createDeviceModel(input)).toThrow(ValidationError);
    });

    it('should throw error if totalQuantity is not a number', () => {
        const input = {
            id: 'device-123',
            brand: 'Apple',
            model: 'MacBook Pro',
            category: 'Laptop',
            totalQuantity: '10',
        };

        expect(() => createDeviceModel(input)).toThrow(ValidationError);
    });
});
