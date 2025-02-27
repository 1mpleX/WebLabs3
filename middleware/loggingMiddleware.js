const customLogger = (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(
            `[${req.method}] ${req.path} - Status: ${res.statusCode} - ${duration}ms`
        );
    });

    next();
};

module.exports = customLogger; 