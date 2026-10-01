import { body, header, param, query } from "express-validator";

const locationKeyMap = new Map([
    [query, 'query'],
    [body, 'body'],
    [param, 'params'],
    [header, 'headers']
]);

const applyBaseValidation = (location, field, { required = true, customMessage, defaultValue } = {}) => {
    let chain = location(field);

    if (required) {
        const emptyMessage = customMessage || `${field} es requerido`;
        chain = chain.notEmpty().withMessage(emptyMessage).bail();
    } else
        chain = chain.optional();

    if (defaultValue !== undefined)
        chain = chain.default(defaultValue);

    return chain;
};

export const validateString = (field, options = {}) => {
    const { location = body } = options;
    return applyBaseValidation(location, field, options)
        .isString().withMessage(`${field} debe ser un string`)
        .trim()
        .escape();
};

export const validateNumber = (field, options = {}) => {
    const { location = body, min } = options;
    const baseMessage = min !== undefined
        ? `${field} debe ser un número entero mayor o igual a ${min}`
        : `${field} debe ser un número entero`;

    return applyBaseValidation(location, field, options)
        .isInt(min !== undefined ? { min } : {})
        .withMessage(baseMessage)
        .toInt();
};

export const validateBoolean = (field, options = {}) => {
    const { location = body } = options;
    return applyBaseValidation(location, field, options)
        .isBoolean().withMessage(`${field} debe ser true o false`)
        .toBoolean();
};

export const validateMongoId = (field, options = {}) => {
    const { location = body } = options;
    return applyBaseValidation(location, field, options)
        .isMongoId().withMessage(`${field} debe ser un Id válido`);
};

export const validateEnum = (field, enumObject, options = {}) => {
    const { location = body } = options;
    const validValues = Object.values(enumObject);
    const msg = `${field} debe ser uno de: ${validValues.join(', ')}`;

    return applyBaseValidation(location, field, options)
        .isIn(validValues).withMessage(msg);
};

export const validateDate = (field, options = {}) => {
    const { location = body, allowPastDate = true, requireUTC = false } = options;

    let chain = applyBaseValidation(location, field, options)
        .isISO8601().withMessage(`${field} debe ser una fecha válida ISO 8601`);

    if (requireUTC) {
        chain = chain.bail().custom(value => {
            if (!value.endsWith('Z')) throw new Error(`${field} debe ser UTC (ej. YYYY-MM-DDTHH:mm:ssZ)`);
            return true;
        });
    }

    if (!allowPastDate) {
        chain = chain.custom(value => {
            if (new Date(value) < new Date()) throw new Error(`${field} no puede ser una fecha pasada`);
            return true;
        });
    }

    return chain;
};

export const validateArray = (field, options = {}) => {
    const { location = body, required = true, itemType } = options;

    let arrayChain = applyBaseValidation(location, field, options);

    if (location === query) {
        arrayChain = arrayChain.customSanitizer(value => {
            if (typeof value === 'string') return value.split(',');
            return value;
        }).toArray();
    }

    arrayChain = arrayChain.isArray({ min: required ? 1 : 0 })
        .withMessage(`${field} debe ser un array${required ? ' no vacío' : ''}`);

    let itemChain = location(`${field}.*`);
    if (!required) itemChain = itemChain.optional();

    switch (itemType) {
        case 'string':
            itemChain = itemChain.isString().withMessage(`Cada elemento de ${field} debe ser un string`);
            break;
        case 'number':
            itemChain = itemChain.isInt().withMessage(`Cada elemento de ${field} debe ser un número`);
            break;
        case 'id':
            itemChain = itemChain.isMongoId().withMessage(`Cada elemento de ${field} debe ser un Id válido`);
            break;
    }

    return itemType ? [arrayChain, itemChain] : arrayChain;
};

export const validateDateRange = (dateFromField, dateToField, location = body) => {
    return location(dateToField).custom((value, { req }) => {
        const reqData = req[locationKeyMap.get(location) || 'body'];
        const from = reqData[dateFromField];
        if (from && value && new Date(value) < new Date(from))
            throw new Error(`${dateToField} no puede ser anterior a ${dateFromField}`);
        return true;
    });
};

export const validateMutuallyExclusive = (fieldA, fieldB, options = {}) => {
    const { neitherMessage, bothMessage, location = body } = options;
    const both = bothMessage || `No se puede enviar ${fieldA} y ${fieldB} a la vez.`;
    const neither = neitherMessage || `Se debe enviar ${fieldA} o ${fieldB}.`;

    return location(fieldA).custom((value, { req }) => {
        const reqData = req[locationKeyMap.get(location) || 'body'];
        const hasA = !!value;
        const hasB = !!reqData[fieldB];

        if (hasA && hasB) throw new Error(both);
        if (!hasA && !hasB) throw new Error(neither);

        return true;
    });
};

export const validateRequiredOneOfHeaders = (headersArr, errorMessage) => {
    return header().custom((_, { req }) => {
        const found = headersArr.filter(h => !!req.headers[h.toLowerCase()]);
        if (found.length !== 1) throw new Error(errorMessage);
        return true;
    });
};