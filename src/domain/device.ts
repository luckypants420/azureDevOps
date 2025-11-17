// Type definitions for DeviceModel
export interface IDeviceInput {
    id: string;
    brand: string;
    model: string;
    category: string;
    totalQuantity: number;
}

export interface IDeviceModel extends IDeviceInput {
    readonly createdAt: Date;
}

// Validation error class
export class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

// Validation utility
const isValidDeviceInput = (input: unknown): input is IDeviceInput => {
    if (!input || typeof input !== 'object') {
        return false;
    }

    const obj = input as Record<string, unknown>;

    return (
        typeof obj.id === 'string' &&
        obj.id.trim() !== '' &&
        typeof obj.brand === 'string' &&
        obj.brand.trim() !== '' &&
        typeof obj.model === 'string' &&
        obj.model.trim() !== '' &&
        typeof obj.category === 'string' &&
        obj.category.trim() !== '' &&
        typeof obj.totalQuantity === 'number' &&
        obj.totalQuantity >= 0 &&
        Number.isInteger(obj.totalQuantity)
    );
};

const getValidationError = (input: unknown): string => {
    if (!input || typeof input !== 'object') {
        return 'Input must be a non-null object';
    }

    const obj = input as Record<string, unknown>;

    if (!obj.id || typeof obj.id !== 'string' || (obj.id as string).trim() === '') {
        return 'Field "id" is required and must be a non-empty string';
    }

    if (!obj.brand || typeof obj.brand !== 'string' || (obj.brand as string).trim() === '') {
        return 'Field "brand" is required and must be a non-empty string';
    }

    if (!obj.model || typeof obj.model !== 'string' || (obj.model as string).trim() === '') {
        return 'Field "model" is required and must be a non-empty string';
    }

    if (!obj.category || typeof obj.category !== 'string' || (obj.category as string).trim() === '') {
        return 'Field "category" is required and must be a non-empty string';
    }

    if (typeof obj.totalQuantity !== 'number' || obj.totalQuantity < 0 || !Number.isInteger(obj.totalQuantity)) {
        return 'Field "totalQuantity" is required and must be a non-negative integer';
    }

    return 'Validation failed';
};

// Factory function to create DeviceModel instances
export const createDeviceModel = (input: unknown): IDeviceModel => {
    if (!isValidDeviceInput(input)) {
        throw new ValidationError(getValidationError(input));
    }

    return {
        id: input.id.trim(),
        brand: input.brand.trim(),
        model: input.model.trim(),
        category: input.category.trim(),
        totalQuantity: input.totalQuantity,
        createdAt: new Date(),
    };
};
