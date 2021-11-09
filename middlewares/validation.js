const validate = (schema) => async (req, res, next) => {
    try {
        await schema.validate(req.body);
        return next();
    } catch (err) {
        return res.status(500).json(err.message);
    }
};

export default validate;